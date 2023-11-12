import express from "express";
import { addWatchLater, deleteWatchLater, getWatchLater } from "../controllers/watchLater";
import { isAuthorized } from "../middleware/index";

export default (router: express.Router) => {
    router.post("/watch-later", isAuthorized, addWatchLater);
    router.get("/watch-later", isAuthorized, getWatchLater);
    router.delete("/watch-later/:id", isAuthorized, deleteWatchLater)
};