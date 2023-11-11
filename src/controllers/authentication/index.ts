import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { prismadb } from "../../../src/index";

export const login = async(req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        if(!email || !password){
            throw new Error("Invalid Credentials");
        };

        if(password < 7 ){
            throw new Error("Password should be at least 8 values");
        };

        const user = await prismadb.user.findUnique({
            where: {
                email
            }
        });

        if(!user){
            return  res.status(404).json({ message: "User does not exist" }).end();
        };

        const comparePassword = await bcrypt.compare(password, user.hashedPassword);

        if(comparePassword !== true) {
            return res?.status(401).json({ message: "Invalid Password" }).end();
        };

        const access_token = jwt.sign({email: user.email, id: user?.id, userType: user?.userType}, process.env.JWT_SECRET, {expiresIn: "2 days"});
        const refresh_token = jwt.sign({email: user.email, id: user?.id, userType: user?.userType}, process.env.JWT_SECRET, {expiresIn: "3 days"});

        return res.status(200).json({status: "success", message: null, data: {...user, access_token, refresh_token}});

    } catch (error) {
        console.log({error_server: error});
        res.status(500).end();
    };
};


export const register = async(req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
        if(!name || !email || !password){
            throw new Error("Invalid Credentials");
        };

        if(password < 7 ){
            throw new Error("Password should be at least 8 values");
        };

        const existingUser = await prismadb.user.findUnique({
            where: {
                email
            }
        });

        if(existingUser){
            return res.status(403).json({ message: "User already exists" }).end();
        }

        const saltRounds = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const user = await prismadb.user.create({
            data: {
                name,
                email,
                hashedPassword,
            }
        });
        
        return res.status(201).json(user);

    } catch (error) {
        console.log({error_server: error});
        res.status(500).end();
    };
};