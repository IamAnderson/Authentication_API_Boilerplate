import express from "express";
import authentication from "./authentication";
import users from "./user";
import movies from "./movie";


const router = express.Router();

export default (): express.Router => {
    authentication(router);
    users(router);
    movies(router);
    return router;
};