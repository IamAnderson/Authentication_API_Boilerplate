import { Request, Response } from "express";
import { prismadb } from "../../../src/index";
import { UserRole } from "@prisma/client";

const handleServerError = (error: any, res: Response) => {
  console.error({ error_server: error });
  res.status(500).json({ message: "Internal Server Error" });
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prismadb.user.findMany({
      orderBy: {
        name: "desc"
      }
    });
    return res
      .status(200)
      .json({ status: "success", message: null, data: users });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params?.id;
    const user = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Nonexistent User!" });
    }

    return res
      .status(200)
      .json({ status: "success", message: null, data: user });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params?.id;
    const existingUser = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Nonexistent User!" });
    }

    const updatedUser = await prismadb.user.update({
      data: req.body,
      where: { id: userId },
    });

    return res
      .status(200)
      .json({ status: "success", data: { ...updatedUser } });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params?.id;
    const existingUser = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Nonexistent User!" });
    }

    await prismadb.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({
      status: "success",
      message: `User with id: ${userId} deleted`,
    });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {

    const userId = req.params?.userId;

    const { role }: { userId: string; role: UserRole } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Invalid field" });
    }

    const existingUser = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Nonexistent User!" });
    }

    await prismadb.user.update({
      data: {
        role: role,
      },
      where: { 
        id: existingUser.id
       },
    });

    return res
      .status(200)
      .json({ status: "success", message: "User role updated!"});
  } catch (error) {
    handleServerError(error, res);
  }
};
