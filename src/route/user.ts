import express from "express";
import { getUsers, getUser, updateUser, deleteUser } from "../controllers/user";
import { isAdmin, isAuthorized } from "../middleware/index";


export default (router: express.Router) => {
    router.get("/users", isAdmin, getUsers);
    router.get("/users/:id", isAuthorized, getUser);
    router.patch("/users/:id", isAuthorized, updateUser);
    router.delete("/users/:id", isAuthorized, deleteUser);
}