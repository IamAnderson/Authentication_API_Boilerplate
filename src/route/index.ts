import express from "express";
import authentication from "./authentication";
import users from "./user";
import movies from "./movie";
import favorite from "./favorite";
import watchLater from "./watchLater";


const router = express.Router();

export default (): express.Router => {
    authentication(router);
    users(router);
    movies(router);
    favorite(router);
    watchLater(router);
    return router;
};