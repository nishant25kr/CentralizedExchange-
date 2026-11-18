import z from "zod"

export const signupSchema = z.object({
    username: z.string(),
    password: z.string()
})

export type AuthenticatedRequest = Request & {
    user: {
        id: string;
        username: string;
    };
};

export const signinSchema = z.object({
    username: z.string(),
    password: z.string()
})

export const onrampSchema = z.object({
    qty: z.number()
})

export const OrderRequestSchema = z.object({
    type: z.string(),
    side: z.string(),
    qty: z.number(),
    price: z.number(),
    asset : z.string()
})