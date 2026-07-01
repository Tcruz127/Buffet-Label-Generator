import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2).max(100).optional().or(z.literal("")),
  email: z.string().email(),
  password: z.string().min(8, "Password must contain a minimum of 8 characters").max(100),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});