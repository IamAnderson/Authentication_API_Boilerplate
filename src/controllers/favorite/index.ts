import { Request, Response } from "express";
import { prismadb } from "../../../src/index";
import { without } from "lodash";

export const addFavorite = async (req: Request, res: Response) => {
  const { movieId } = req.body;
  try {
    const existingMovie = await prismadb.movie.findUnique({
      where: {
        id: movieId,
      },
    });

    if (!existingMovie) {
      return res.status(404).json({ message: "Invalid ID" });
    }

    await prismadb.user.update({
      where: {
        //@ts-ignore
        id: req.user?.id,
      },
      data: {
        favoriteIds: {
          push: movieId,
        },
      },
    });

    return res
      .status(200)
      .json({ status: "success", message: null, data: `${movieId} has been added to favorite` });
  } catch (error) {
    console.log({ err_server: error });
    return res.status(500).end();
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const user = await prismadb.user.findUnique({
      where: {
        //@ts-ignore
        id: req.user?.id,
      },
    });

    const favorites = await prismadb.movie.findMany({
      where: {
        id: {
          //@ts-ignore
          in: user?.favoriteIds,
        },
      },
    });

    return res
      .status(200)
      .json({ status: "success", message: null, data: favorites });
  } catch (error) {
    console.log({ err_server: error });
    return res.status(500).end();
  }
};

export const deleteFavorite = async (req: Request, res: Response) => {
  const { movieId } = req.body;

  try {
    const existingMovie = await prismadb.movie.findUnique({
      where: {
        id: movieId,
      },
    });

    if (!existingMovie) {
      return res.status(404).json({ message: "Invalid ID" });
    }

    const user = await prismadb.user.findUnique({
      where: {
        //@ts-ignore
        id: req.user?.id,
      },
    });

    const favoriteIds = without(user?.favoriteIds, movieId)
    // const favoriteIds = user?.favoriteIds?.filter((id) => id === movieId);

    await prismadb.user.update({
      where: {
        id: user?.id,
      },
      data: {
        favoriteIds: favoriteIds,
      },
    });

    return res
      .status(200)
      .json({ status: "success", message: null, data: `${movieId} has been removed from favorite` });
  } catch (error) {
    console.log({ err_server: error });
    return res.status(500).end();
  }
};
