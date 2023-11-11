import { Request, Response } from "express";
import { prismadb } from "../../../src/index";

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
    
    return res.status(200).json({ status: "success", message: null, data: shuffleOutMovie });
    
  } catch (error) {
    console.log({ err_server: error });
    return res.status(500).end();
  }
};
