import express from "express";
import { login, register, resendEmailVerification, verifyEmail, forgotPassword, resetPassword } from "../controllers/authentication";

export default (router: express.Router) => {
    router.post("/auth/login", login);
    router.post("/auth/register", register);
    router.post("/auth/verify-otp", verifyEmail);
    router.post("/auth/resend-otp", resendEmailVerification);
    router.post("/auth/forgot-password", forgotPassword)
    router.post("/auth/reset-password", resetPassword);
}