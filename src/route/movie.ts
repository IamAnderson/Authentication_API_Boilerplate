import express from "express";
import { addMovie, getMovies, getMovie, updateMovie, deleteMovie } from "../controllers/movie";


export default (router: express.Router) => {
    router.post("/movies", addMovie);
    router.get("/movies", getMovies);
    router.get("/movies/:id", getMovie);
    router.patch("/movies/:id", updateMovie);
    router.delete("/movies/:id", deleteMovie);
}