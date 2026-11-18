import express from 'express';
import type { Request, Response } from 'express';
import { middleware, SECRET_KEY } from "../middleware/middleware";
import jwt from "jsonwebtoken";
import { onrampSchema, OrderRequestSchema, signupSchema, type AuthenticatedRequest } from '../src/types';
import { OrderBook } from '../src/orderbook';

const route = express.Router();

let USER_INDEX = 0;

const USERS: { id: string; username: string; password: string }[] = [];
const SOL_ORDERBOOK = new OrderBook('sol')
const balance: Map<string, {available: number, locked: number}> = new Map();
const stockBalance: Map<string, Map<string, {available: number, locked: number}>> = new Map();

route.post("/onramp", (req: Request, res: Response) => {
    const user = (req as unknown as AuthenticatedRequest).user
    const parsedData = onrampSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(404).json({
            message : "Validation failed"
        })
    }

    try {
        const blc = balance.get(user.id)?.available;
        balance.set(user.id,{available: blc! + parsedData.data.qty, locked: balance.get(user.id)?.locked!});
        return res.status(200).json({
            message:"Balance updated successfylly"
        })
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
        usdBalance: balance.get(user.id)?.available ?? 0,
        // stockBalance: Object.fromEntries(userStocks)
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

route.post("/order",middleware, (req: Request, res: Response) => {
    const user = (req as unknown as AuthenticatedRequest).user
    const parsedData = OrderRequestSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(404).json({message:"Validation failed"})
    }
    const body = parsedData.data;
    if(body.side == "bid"){
        const amountTospend = body.price * body.qty;
        const userBalance = balance.get(user.id)?.available;
        if(userBalance! < amountTospend){
            return res.status(411).json({
                message: "Insufficient balance"
            })
        }
        
        if(body.asset == 'sol'){
            let fills = SOL_ORDERBOOK.addOrder(user.id.toString(),'bids',body.price,body.qty);
            fills.forEach( fill => {
                if(fill.type == 'fill'){
                    stockBalance.get(fill.buyer)!.set("sol",{
                        available: stockBalance.get(fill.buyer)!.get("sol")!.available + fill.qty,
                        locked: stockBalance.get(fill.buyer)!.get("sol")!.locked
                    })
                    stockBalance.get(fill.seller)!.set("sol",{
                        available: stockBalance.get(fill.seller)!.get("sol")!.available + fill.qty,
                        locked: stockBalance.get(fill.seller)!.get("sol")!.locked -= fill.qty
                    })
                    balance.set(user.id,{
                        available: balance.get(user.id)?.available! - fill.price * fill.qty,
                        locked: balance.get(user.id)?.locked!
                    })
                    balance.set(fill.seller,{
                        available: balance.get(fill.seller)?.available! + fill.price * fill.qty,
                        locked: balance.get(fill.seller)?.locked!
                    })
                }
                if(fill.type == 'orderbook_update'){
                    
                }
            })
        }

    }
})

export { route };