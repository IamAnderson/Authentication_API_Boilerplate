import { Request, Response } from "express";
import { prismadb } from "../../../src/index";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prismadb.user.findMany();

    return res
      .status(200)
      .json({ status: "success", message: null, data: users });
  } catch (error) {
    console.log({ error_server: error });
    res.status(500).end();
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const existingUser = await prismadb.user.findUnique({
        where: {
            id: req.params.id
        }
    });

    if(!existingUser){
        return res.status(403).json({ message: "User does not exists" }).end();
    }

    const user = await prismadb.user.findUnique({
      where: {
        id: req.params?.id,
      },
    });

    return res
      .status(200)
      .json({ status: "success", message: null, data: user });
  } catch (error) {
    console.log({ error_server: error });
    res.status(500).end();
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const existingUser = await prismadb.user.findUnique({
        where: {
            id: req.params.id
        }
    });

    if(!existingUser){
        return res.status(403).json({ message: "User does not exists" }).end();
    }

    const user = await prismadb.user.update({
      where: {
        id: req.params?.id,
      },
      data: req.body,
    });

    return res
      .status(200)
      .json({ status: "success", message: null, data: user });
  } catch (error) {
    console.log({ error_server: error });
    res.status(500).end();
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const existingUser = await prismadb.user.findUnique({
        where: {
            id: req.params.id
        }
    });

    if(!existingUser){
        return res.status(403).json({ message: "User does not exists" }).end();
    }

    const user = await prismadb.user.delete({
        where: {
            id: req.params?.id
        }
    });

    return res
    .status(200)
    .json({ status: "success", message: null, data: `${user?.id} has been deleted` });

  } catch (error) {
    console.log({ error_server: error });
    res.status(500).end();
  }
};
