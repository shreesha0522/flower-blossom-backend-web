import mongoose from "mongoose";
import { connectDatabase } from "../database/mongodb";

beforeAll(async () => {
    // Connect to the database before running tests
    await connectDatabase();
});

afterAll(async () => {
    // Close database connection after all tests
    await mongoose.connection.close();
});
