import { Request, Response } from "express";
import { prismadb } from "../../../src/index";
import { without } from "lodash";

export const addWatchLater = async (req: Request, res: Response) => {
  const { movieId } = req.body;

  try {
    const existingMovie = await prismadb.movie.findUnique({
      where: {
        id: movieId,
      },
    });

    if (!existingMovie) {
      return res.status(404).json({ message: "Movie does not exist" }).end();
    }

    await prismadb.user.update({
      where: {
        //@ts-ignore
        id: req?.user?.id,
      },
      data: {
        watchLaterIds: {
          push: movieId,
        },
      },
    });

    return res.status(200).json({
      status: "success",
      message: null,
      data: `${movieId} has been added to watchLater`,
    });
  } catch (error) {
    console.log({ err_server: error });
    return res.status(500).end();
  }
};

export const getWatchLater = async (req: Request, res: Response) => {
  const { movieId } = req.body;

  try {
    const user = await prismadb.user.findUnique({
      where: {
        //@ts-ignore
        id: req?.user?.id,
      },
    });

    const watchLater = await prismadb.movie.findMany({
      where: {
        id: {
          in: user?.watchLaterIds,
        },
      },
    });

    return res
      .status(200)
      .json({ status: "success", message: null, data: watchLater });
  } catch (error) {
    console.log({ err_server: error });
    return res.status(500).end();
  }
};

export const deleteWatchLater = async (req: Request, res: Response) => {
  const movieId = req.params?.id;

  try {
    const existingMovie = await prismadb.movie.findUnique({
      where: {
        id: movieId,
      },
    });

    if (!existingMovie) {
      return res.status(404).json({ message: "Movie does not exist" }).end();
    }

    const user = await prismadb.user.findUnique({
      where: {
        //@ts-ignore
        id: req?.user?.id,
      },
    });

    const watchLaterIds = without(user?.watchLaterIds, movieId);

    await prismadb.user.update({
      where: {
        //@ts-ignore
        id: req?.user?.id,
      },
      data: {
        watchLaterIds: watchLaterIds,
      },
    });

    return res.status(200).json({
      status: "success",
      message: null,
      data: `${movieId} has been removed from Watch Later`,
    });
  } catch (error) {
    console.log({ err_server: error });
    return res.status(500).end();
  }
};
