import express from "express";
import { addFavorite, getFavorites } from "../controllers/favorite";
import { isAuthorized } from "../middleware";



export default (router: express.Router) => {
    router.post("/favorites", addFavorite );
    router.get("/favorites", isAuthorized, getFavorites);
}