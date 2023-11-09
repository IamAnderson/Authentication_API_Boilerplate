import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import router from "./route";
import { PrismaClient } from "@prisma/client";


const app = express();
export const prismadb = new PrismaClient();
dotenv.config();

app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: "50mb" }));

app.get("/", (_, res) => {
    res.json({ message: "Use the endpoints" })
});

app.use("/api", router());

const server = http.createServer(app);

server.listen(8000, () => {
    console.log("🚀 Pluto is active at: http://localhost:8000")
});