import { Request, Response } from "express";
import { prismadb } from "../../../src/index";

export const addFavorite = async (req: Request, res: Response) => {
  const { movieId } = req.body;
  try {
    const existingMovie = await prismadb.movie.findUnique({
      where: {
        id: movieId,
      },
    });

    if (!existingMovie) {
      return res.status(404).json({ message: "Movie does not exist" });
    }

    const movie = prismadb.user.update({
      where: {
        email: req.body
      },
      data: {
        favoriteIds: {
          push: movieId,
        },
      },
    });

    return res.status(200).json({ status: "success", message: null, data: movie });

  } catch (error) {
    console.log({ err_server: error });
    return res.status(500).end();
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const user = prismadb.user.findUnique({
        where: {
            //@ts-ignore
            id: req.user?.id
        }
    });

    console.log(req?.user)

    const favorites = prismadb.movie.findMany({
        where: {
            id: {
                //@ts-ignore
                in: user?.favoriteIds
            }
        }
    });

    return res.status(200).json({ status: "success", message: null, data: favorites });

  } catch (error) {
    console.log({ err_server: error });
    return res.status(500).end();
  }
};
