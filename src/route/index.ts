import express from "express";
import authentication from "./authentication";
import users from "./user";
import movies from "./movie";
import favorite from "./favorite";


const router = express.Router();

export default (): express.Router => {
    authentication(router);
    users(router);
    movies(router);
    favorite(router);
    return router;
};