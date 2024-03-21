import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { prismadb } from "../../../src/index";
import { Response } from "express";

export const sendOTPVerificationEmail = async (
  email: string,
  res: Response
) => {
  try {

    

    res.json({
      status: "pending",
      message: "Verification email sent",
      data: `Verification email sent to ${email}`,
    });
  } catch (error) {
    console.log({ OTP_catch: error });
  }
};
