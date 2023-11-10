import express from "express";
import { getUsers, getUser, updateUser, deleteUser } from "../controllers/user";


export default (router: express.Router) => {
    router.get("/users", getUsers);
    router.get("/users/:id", getUser);
    router.patch("/users/:id", updateUser);
    router.delete("/users/:id", deleteUser);
}