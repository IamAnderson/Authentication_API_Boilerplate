import { Request, Response } from "express";
import { prismadb } from "../../../src/index";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generatePasswordResetToken, generateVerificationToken } from "./token";
import { sendPasswordResetEmail, sendVerificationEmail } from "./mail";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    if (password?.length < 7) {
      return res
        .status(400)
        .json({ message: "Password should be at least 8 values" });
    }

    const existingUser = await prismadb.user.findUnique({
      where: {
        email,
      },
    });

    if (!existingUser || !existingUser?.email) {
      return res.status(404).json({ message: "Nonexistent User!" }).end();
    }

    const comparePassword = await bcrypt.compare(
      password,
      existingUser?.password
    );

    if (!comparePassword) {
      return res?.status(401).json({ message: "Invalid Password" }).end();
    }

    if (!existingUser?.emailVerified) {
      await generateVerificationToken(email);
      return res
        .status(200)
        .json({ status: "success", message: "Confirmation email sent!" });
    }

    const access_token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser?.id,
        role: existingUser?.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3 days" }
    );

    const refresh_token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser?.id,
        role: existingUser?.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3 days" }
    );

    return res.status(200).json({
      status: "success",
      access_token,
      refresh_token,
      data: { ...existingUser },
    });
  } catch (error) {
    console.log("[LOGIN]:", error);
    res.status(500).end();
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Fill in credentials!" });
    }

    if (password?.length < 7) {
      return res
        .status(400)
        .json({ message: "Password should be at least 8 values" });
    }

    const existingUser = await prismadb.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(403).json({ message: "User already exists" }).end();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prismadb.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    const verificationToken = await generateVerificationToken(email);

    await sendVerificationEmail(
      verificationToken?.email,
      verificationToken?.token
    );

    return res.status(201).json({ user });
  } catch (error) {
    console.log("[REGISTER]:", error);
    res.status(500).end();
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { code } = req.body;

    const existingToken = await prismadb.verificationToken.findUnique({
      where: {
        token: code,
      },
    });

    if (!existingToken) {
      return res.status(403).json({ message: "Invalid Token" }).end();
    }

    const hasExpired = new Date(existingToken?.expires) < new Date();

    if (hasExpired) {
      return res.status(403).json({ message: "Token has expired" }).end();
    }

    const existingUser = await prismadb.user.findUnique({
      where: {
        email: existingToken?.email,
      },
    });

    await prismadb.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        emailVerified: new Date(),
        email: existingToken?.email,
      },
    });

    await prismadb.verificationToken.delete({
      where: {
        id: existingToken?.id,
        email: existingToken?.email,
      },
    });
  } catch (error) {
    console.log("[VERIFY_EMAIL]:", error);
    res.status(500).end();
  }
}

export async function resendEmailVerification(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const existingUser = await prismadb.user.findUnique({
      where: {
        email,
      },
    });

    if (!existingUser || existingUser?.email) {
      return res.status(404).json({ message: "Nonexistent User!" }).end();
    }

    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    await sendVerificationEmail(
      verificationToken?.email,
      verificationToken?.token
    );
  } catch (error) {
    console.log("[RESEND_VERIFICATION_EMAIL]:", error);
    res.status(500).end();
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const existingUser = await prismadb.user.findUnique({
      where: {
        email,
      },
    });

    if (!existingUser || !existingUser.email) {
      return res.status(404).json({ message: "Nonexistent User!" }).end();
    }

    const generatedToken = await generatePasswordResetToken(
      existingUser?.email
    );

    await sendPasswordResetEmail(generatedToken?.email, generatedToken?.token);

    return res.status(200).json({
      message: "Email has been sent!",
    });
  } catch (error) {}
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, password, password_confirmation } = req.body;

    const existingUser = await prismadb.user.findUnique({
      where: {
        email,
      },
    });

    if (!existingUser || !existingUser.email) {
      return res.status(404).json({ message: "Nonexistent User!" }).end();
    }

    if (!password || !password_confirmation) {
      return res.status(400).json({ message: "Invalid Input!" });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({ message: "Password do not match!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prismadb.user.update({
      data: {
        password: hashedPassword,
      },
      where: {
        id: existingUser?.id,
        email: existingUser?.email,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Password reset successfully!",
    });
  } catch (error) {
    console.log("[RESET_PASSWORD]:", error);
    res.status(500).end();
  }
}
