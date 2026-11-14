import express from 'express';
import type { Request, Response } from 'express';
import { middleware, SECRET_KEY } from "../middleware/middleware";
import jwt from "jsonwebtoken";
import { signupSchema, type AuthenticatedRequest } from '../src/types';

const route = express.Router();

let USER_INDEX = 0;

const USERS: { id: number; username: string; password: string }[] = [];

const balance: Map<number, number> = new Map();
const stockBalance: Map<number, Map<number, number>> = new Map();

route.post("/onramp", (req: Request, res: Response) => {
    try {
        
    } catch (error) {

    }
})  

route.get("/balance", middleware, (req: Request, res: Response) => {
    console.log("hello")
    const authReq = req as unknown as AuthenticatedRequest;
    // console.log(authReq)
    if (!authReq.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = authReq.user
    const userStocks = stockBalance.get(user.id) ?? new Map<number, number>();
    console.log("hello2", user)

    res.status(200).json({
        usdBalance: balance.get(user.id) ?? 0,
        stockBalance: Object.fromEntries(userStocks)
    })
})

route.post("/signup", (req: Request, res: Response) => {
    const parsedData = signupSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(404).json({ message: "Validation failed" });
    }
    const { username, password } = parsedData.data;

    if (USERS.find((u) => u.username === username)) {
        return res.status(403).json({
            message: "User already exists",
        });
    }

    const id = USER_INDEX++;
    USERS.push({
        id,
        username,
        password,
    });
    balance.set(id, 0);
    stockBalance.set(id, new Map());

    return res.status(200).json({
        message: "Successfully created user",
    });
});

route.post("/signin", (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        console.log(username, password)
        const user = USERS.find((u) => u.username === username);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Wrong password" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);

        return res.status(200).json({
            message: "Successfully login",
            data: {
                token,
            },
        });
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
});

route.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello there" });
});

export { route };