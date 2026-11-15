import z from "zod"

export const signupSchema = z.object({
    username: z.string(),
    password: z.string()
})

export type AuthenticatedRequest = Request & {
    user: {
        id: number;
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