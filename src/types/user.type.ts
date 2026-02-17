import z from "zod";

export const UserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImage: z.string().optional(),  
  role: z.enum(["user", "admin"]).default("user"),
  bio: z.string().optional(),
  phone: z.string().optional(),
  
  // 👇 ADD THESE - Make them optional and nullable
  resetPasswordToken: z.string().nullable().optional(),
  resetPasswordExpires: z.date().nullable().optional(),
});

export type UserType = z.infer<typeof UserSchema>;