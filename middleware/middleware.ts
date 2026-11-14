import jwt, { type JwtPayload } from "jsonwebtoken"
import type { NextFunction, Request, Response } from "express"

export const SECRET_KEY = process.env.JWT_SECRET || "development-secret"

export const middleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Token not provided"
        })
    }

    const token = authHeader.split(" ")[1]
    console.log(token)
    try {
        const user = jwt.verify(token!, SECRET_KEY) as JwtPayload;
        (req as any).user = user
        console.log(user)
        return next()
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Invalid token"
        return res.status(401).json({ message })
    }
}