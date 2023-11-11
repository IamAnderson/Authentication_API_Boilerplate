import express from "express";
import { addMovie, getMovies, getMovie, updateMovie, deleteMovie , randomMovie} from "../controllers/movie";
// import { randomMovie } from "../controllers/random";
import { isAdmin, isAuthorized } from "../middleware";


export default (router: express.Router) => {
    router.post("/movies", isAdmin, addMovie);
    router.get("/movies", isAuthorized, getMovies);
    router.get("/movies/:id", isAuthorized, getMovie);
    router.patch("/movies/:id", isAdmin, updateMovie);
    router.delete("/movies/:id", isAdmin, deleteMovie);
    router.get("/movies/random", isAuthorized, randomMovie);
}