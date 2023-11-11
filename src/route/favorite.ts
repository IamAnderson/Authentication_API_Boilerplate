import express from "express";
import { addFavorite, deleteFavorite, getFavorites } from "../controllers/favorite";
import { isAuthorized } from "../middleware";



export default (router: express.Router) => {
    router.post("/favorites", isAuthorized, addFavorite );
    router.get("/favorites", isAuthorized, getFavorites);
    router.delete("/favorites", isAuthorized, deleteFavorite);
}