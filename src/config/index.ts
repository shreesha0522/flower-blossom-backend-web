export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/flower-blossom-db";
export const JWT_SECRET = process.env.JWT_SECRET || "flowerblossom_secret_key";
