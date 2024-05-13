import { Request, Response } from "express";
import { prismadb } from "../../../src/index";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generatePasswordResetToken, generateVerificationToken } from "./token";
import { sendPasswordResetEmail, sendVerificationEmail } from "./mail";
import { validateEmail } from "../../hooks/validate-email";
import { validatePassword } from "../../hooks/validate-password";

export async function login(req: Request, res: Response) {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    if (password?.length < 7) {
      return res
        .status(400)
        .json({ message: "Password should be at least 8 characters" });
    }

    const existingUser = await prismadb.user.findUnique({
      where: {
        email,
      },
    });

    if (!existingUser || !existingUser?.email) {
      return res.status(404).json({ message: "Nonexistent User!" });
    }

    const comparePassword = await bcrypt.compare(
      password,
      existingUser?.password
    );

    if (!comparePassword) {
      return res?.status(401).json({ message: "Invalid Password" });
    }

    // In Case account have not been verified;
    //Commented out because next-auth can't process this response,
    //it would work in normal authentication though, so for now, handle email verification in frontend.

    // if (!existingUser?.emailVerified) {
    //   const verificationToken = await generateVerificationToken(email);

    //   await sendVerificationEmail(existingUser.email, verificationToken.token);
    //   return res.status(200).json({
    //     status: "success",
    //     emailVerified: false,
    //     message: "Confirmation email sent!",
    //   });
    // }

    if (!existingUser?.emailVerified) {
      const verificationToken = await generateVerificationToken(email);
      await sendVerificationEmail(existingUser.email, verificationToken.token);
    }

    const access_token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser.id,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1hr" }
    );

    const refresh_token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser?.id,
        role: existingUser?.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    await prismadb.user.update({
      data: {
        access_token,
      },
      where: {
        id: existingUser.id,
      },
    });

    return res.status(200).json({
      status: "success",
      message: `${!existingUser.emailVerified && "Confirmation email sent!"}`,
      refresh_token,
      data: { ...existingUser },
    });
  } catch (error) {
    console.log("[LOGIN]:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function account(req: Request, res: Response) {
  try {
    const {
      userId,
      type,
      provider,
      providerAccountId,
      refresh_token,
      access_token,
      expires_at,
      token_type,
      scope,
      id_token,
      session_state,
    }: {
      userId: string;
      type: string;
      provider: string;
      providerAccountId: string;
      refresh_token?: string;
      access_token?: string;
      expires_at?: number;
      token_type?: string;
      scope?: string;
      id_token?: string;
      session_state?: string;
    } = req.body;

    if (!type || !provider || !providerAccountId) {
      return res.status(400).json({ message: "Invalid field" });
    }
    
    const oauthAccount = await prismadb.account.create({
      data: {
        userId,
        type,
        provider,
        providerAccountId,
        refresh_token,
        access_token,
        expires_at,
        token_type,
        scope,
        id_token,
        session_state,
      },
    });

    return res.status(200).json({
      status: "success",
      data: { ...oauthAccount },
    });
  } catch (error) {
    console.log("[ACCOUNT]:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Fill in credentials!" });
    }

    const isEmailValid = validateEmail(email);

    if (!isEmailValid) {
      return res.status(400).json({ message: "Invalid email address!" });
    }

    const isPasswordValid = validatePassword(password, res);

    if (!isPasswordValid) {
      return res.status(200).json("Invalid Password");
    }

    const existingUser = await prismadb.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(403).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prismadb.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
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
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { code }: { code: string } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    const existingToken = await prismadb.verificationToken.findUnique({
      where: {
        token: code,
      },
    });

    if (!existingToken) {
      return res.status(403).json({ message: "Invalid Token" });
    }

    const hasExpired = new Date(existingToken?.expires) < new Date();

    if (hasExpired) {
      return res.status(403).json({ message: "Token has expired" });
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

    return res
      .status(200)
      .json({ status: "success", message: "Email verified!" });
  } catch (error) {
    console.log("[VERIFY_EMAIL]:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function resendEmailVerification(req: Request, res: Response) {
  try {
    const { email }: { email: string } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Invalid field" });
    }

    const existingUser = await prismadb.user.findUnique({
      where: {
        email,
      },
    });

    if (!existingUser || !existingUser?.email) {
      return res.status(404).json({ message: "Nonexistent User!" });
    }

    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    await sendVerificationEmail(
      verificationToken?.email,
      verificationToken?.token
    );

    return res
      .status(200)
      .json({ status: "success", message: "Verification email sent!" });
  } catch (error) {
    console.log("[RESEND_VERIFICATION_EMAIL]:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email }: { email: string } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Invalid field" });
    }

    const existingUser = await prismadb.user.findUnique({
      where: {
        email,
      },
    });

    if (!existingUser || !existingUser.email) {
      return res.status(404).json({ message: "Nonexistent User!" });
    }

    const generatedToken = await generatePasswordResetToken(
      existingUser?.email
    );

    await sendPasswordResetEmail(generatedToken.email, generatedToken.token);

    return res.status(200).json({
      status: "success",
      message: "Reset token email has been sent!",
    });
  } catch (error) {
    console.log("[FORGOT_PASSWORD]:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const {
      code,
      password,
      password_confirmation,
    }: { code: string; password: string; password_confirmation: string } =
      req.body;

    if (!password || !password_confirmation || !code) {
      return res.status(400).json({ message: "Invalid field!" });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({ message: "Password do not match!" });
    }

    const existingToken = await prismadb.passwordResetToken.findUnique({
      where: {
        token: code,
      },
    });

    if (!existingToken) {
      return res.status(403).json({ message: "Invalid Token" });
    }

    const hasExpired = new Date(existingToken?.expires) < new Date();

    if (hasExpired) {
      return res.status(403).json({ message: "Token has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prismadb.user.update({
      data: {
        password: hashedPassword,
        email: existingToken?.email,
      },
      where: {
        email: existingToken?.email,
      },
    });

    await prismadb.passwordResetToken.delete({
      where: {
        token: existingToken.token,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Password reset successfully!",
    });
  } catch (error) {
    console.log("[RESET_PASSWORD]:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // Verify the refresh token
    let payload: any = null;
    try {
      payload = jwt.verify(refresh_token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Check if the refresh token is still valid
    const existingUser = await prismadb.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!existingUser) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate a new access token
    const access_token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser.id,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await prismadb.user.update({
      data: {
        access_token,
      },
      where: {
        id: existingUser.id,
      },
    });

    return res
      .status(200)
      .json({ status: "success", message: "Access token refreshed!" });
  } catch (error) {
    console.log("[REFRESH_ACCESS_TOKEN]:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
