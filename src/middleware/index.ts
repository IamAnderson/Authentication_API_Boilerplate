import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

export const isOwner = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.token as string;

        if(authHeader) {
            let auth_token = authHeader?.split(" ")[1]
            jwt.verify(auth_token, process.env.JWT_SECRET, (err, user) => {
                if(err) {
                    return res.status(401).json({ message: "Invalid Token" }).end();
                };

                req.user = user;
                //req.user is a param created by jwt token to save user in a middleware 
                // console.log({REQ: req.user});
            })
        }else{
            return res.status(403).json({ message: "Null Token" }).end();
        };

        next();
        
    } catch (error) {
        console.log({ error_server: error });
        res.status(500).end();
    }
};

export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    try {
        isOwner(req, res, () => {
            //@ts-ignore
            if(req.user?.id || req.user?.userType === "admin"){
                next();
            }else{
                return res.status(401).json({ message: "Invalid Authentication" }).end();
            }
        });
        
    } catch (error) {
        console.log({ error_server: error });
        res.status(500).end();
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        isOwner(req, res, () => {
            //@ts-ignore
            if(req.user?.userType === "admin"){
                next();
            }else{
                console.log(req.params?.id)
                return res.status(403).json({ message: "Not Authorized" }).end();
            }
        });
        
    } catch (error) {
        console.log({ error_server: error });
        res.status(500).end();
    }
};