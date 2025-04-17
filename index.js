import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
connectDB();

const corOptions = {
  origin: process.env.CLIENT_URL || ["http://localhost:5173"],
  credentials : true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};
app.use(cors(corOptions));
// app.use("/api/v1");
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello from ES6 modules!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
