import jwt, { type JwtPayload } from "jsonwebtoken"
import type { NextFunction, Request, Response } from "express";
export const SECRET_KEY: string = "a;lsdj;lfaj;sdlfj"
export const middleware = (req: Request, res: Response, next: NextFunction) => {
    console.log("hello from middleware", req.headers)
    const authHeader = (req.headers.authorization)?.split(" ")[1];
    console.log(authHeader);
    if (!authHeader) {
        return res.status(400).json({
            message: "Token not provided"
        })
    }
    try {
        const user = jwt.verify(authHeader, SECRET_KEY) as JwtPayload
        (req as any).user = user;
        next()
    } catch (error: any) {
        return res.status(404).json({ message: error.message })
    }
}