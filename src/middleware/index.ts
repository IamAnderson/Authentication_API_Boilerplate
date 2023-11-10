import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { get } from "lodash";

export const isOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.token as string;

        if(authHeader) {
            let auth_token = authHeader?.split(" ")[1]
            jwt.verify(auth_token, process.env.JWT_SECRET, (err, user) => {
                if(err) {
                    return res.status(401).json({ message: "Invalid Token" }).end();
                };

                return user
            })
        }else{
            return res.status(401).json({ message: "Invalid Authentication" }).end();
        };

        next();
        
    } catch (error) {
        console.log({ error_server: error });
        res.status(500).end();
    }
};

// export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
//     try {
        
//     } catch (error) {
//         console.log({ error_server: error });
//         res.status(500).end();
//     }
// };