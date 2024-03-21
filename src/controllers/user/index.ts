import { Request, Response } from "express";
import { prismadb } from "../../../src/index";

const handleServerError = (error: any, res: Response) => {
  console.error({ error_server: error });
  res.status(500).end();
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prismadb.user.findMany();
    res.status(200).json({ status: "success", message: null, data: users });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" }).end();
    }

    res.status(200).json({ status: "success", message: null, data: user });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const existingUser = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User does not exist" }).end();
    }

    const updatedUser = await prismadb.user.update({
      where: { id: userId },
      data: req.body,
    });

    res
      .status(200)
      .json({ status: "success", message: null, data: updatedUser });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const existingUser = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User does not exist" }).end();
    }

    await prismadb.user.delete({
      where: { id: userId },
    });

    res
      .status(200)
      .json({
        status: "success",
        message: null,
        data: `${userId} has been deleted`,
      });
  } catch (error) {
    handleServerError(error, res);
  }
};
