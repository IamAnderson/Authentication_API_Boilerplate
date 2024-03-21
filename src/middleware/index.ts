import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface User {
  id: string;
  email: string;
  role: string;
}

export const isOwner = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.token as string;

    if (!authHeader) {
      return res.status(403).json({ message: "Invalid authentication!" }).end();
    }

    const auth_token = authHeader.split(" ")[1];
    jwt.verify(auth_token, process.env.JWT_SECRET, (err, user: User) => {
      if (err) {
        return res.status(401).json({ message: "Invalid Token" }).end();
      }

      req.user = user;
      console.log("[USER_MIDDLEWARE]:", req.user);
      next();
    });
  } catch (error) {
    console.error("[ISOWNER]:", error);
    res.status(500).end();
  }
};

export const isAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    isOwner(req, res, () => {
      const user = req.user as User;
      if (user?.id || user?.role === "ADMIN") {
        next();
      } else {
        return res
          .status(401)
          .json({ message: "Invalid authentication!" })
          .end();
      }
    });
  } catch (error) {
    console.error("[ISAUTHORIZED]:", error);
    res.status(500).end();
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    isOwner(req, res, () => {
      const user = req.user as User;
      if (user?.role === "ADMIN") {
        next();
      } else {
        return res
          .status(403)
          .json({ message: "Not authorized, Admin access only!" })
          .end();
      }
    });
  } catch (error) {
    console.error("[ISADMIN]:", error);
    res.status(500).end();
  }
};
