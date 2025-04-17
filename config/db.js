import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        console.log("Connecting to:", process.env.CONNECT_STRING);
        const conn = await mongoose.connect(process.env.CONNECT_STRING);
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.log("Error connecting to database: ", error.message);
        process.exit(1);
    };
};
