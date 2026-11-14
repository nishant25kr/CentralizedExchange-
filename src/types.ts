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