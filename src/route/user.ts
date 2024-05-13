import express from "express";
import { getUsers, getUser, updateUser, deleteUser, updateUserRole } from "../controllers/user";
import { isAdmin, isAuthorized } from "../middleware/index";


export default (router: express.Router) => {
    router.get("/users", isAdmin, getUsers);
    router.get("/users/:id", isAuthorized, getUser);
    router.put("/users/:id", isAuthorized, updateUser);
    router.delete("/users/:id", isAuthorized, deleteUser);
    router.put("/users/:userId/update-role", isAdmin, updateUserRole);
}