import { Request, Response } from "express";
import { prismadb } from "../../../src/index";

export const addMovie = async (req: Request, res: Response) => {
  try {
    const movie = await prismadb.movie.create({
      data: req.body,
    });

    return res
      .status(201)
      .json({ status: "success", message: null, data: movie });
  } catch (error) {
    console.log({ error_server: error });
    res.status(500).end();
  }
};

export const getMovies = async (req: Request, res: Response) => {
  try {
    const movies = await prismadb.movie.findMany();

    return res
      .status(200)
      .json({ status: "success", message: null, data: movies });
  } catch (error) {
    console.log({ error_server: error });
    res.status(500).end();
  }
};

export const getMovie = async (req: Request, res: Response) => {
  try {
    const existingmovie = await prismadb.movie.findUnique({
      where: {
        id: req.params?.id,
      },
    });

    if (!existingmovie) {
      return res.status(404).json({ message: "Movie does not exists" }).end();
    }

    const movie = await prismadb.movie.findUnique({
      where: {
        id: req.params?.id,
      },
    });

    return res
      .status(200)
      .json({ status: "success", message: null, data: movie });
  } catch (error) {
    console.log({ error_server: error });
    res.status(500).end();
  }
};

export const updateMovie = async (req: Request, res: Response) => {
  try {
    const existingmovie = await prismadb.movie.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existingmovie) {
      return res.status(404).json({ message: "Movie does not exists" }).end();
    }

    const movie = await prismadb.movie.update({
      where: {
        id: req.params?.id,
      },
      data: req.body,
    });

    return res
      .status(200)
      .json({ status: "success", message: null, data: movie });
  } catch (error) {
    console.log({ error_server: error });
    res.status(500).end();
  }
};

export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const existingmovie = await prismadb.movie.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existingmovie) {
      return res.status(404).json({ message: "Movie does not exists" }).end();
    }

    const movie = await prismadb.movie.delete({
      where: {
        id: req.params?.id,
      },
    });

    return res
      .status(200)
      .json({
        status: "success",
        message: null,
        data: `${movie?.id} has been deleted`,
      });
  } catch (error) {
    console.log({ error_server: error });
    res.status(500).end();
  }
};

export const randomMovie = async (req: Request, res: Response) => {
  try {
    const movies = await prismadb.movie.findMany();

    const shuffle = (array: {}[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    const shuffleOutMovie = shuffle(movies);

    return res
      .status(200)
      .json({ status: "success", message: null, data: shuffleOutMovie[0] });
  } catch (error) {
    console.log({ err_server: error });
    return res.status(500).end();
  }
};
