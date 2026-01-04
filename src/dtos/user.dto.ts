import z from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true
}).extend(
  {confirmPassword: z.string().min(6)}
).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Password do not match",
    path: ['confirmPassword']
  }
)

export const LoginUserDTO = z.object({
  email: z.email(),
  password: z.string().min(6)
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;