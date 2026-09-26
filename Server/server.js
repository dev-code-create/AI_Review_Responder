// server.js
import express from "express";
import cron from "node-cron";
import reviewsRouter from "./routes/reviews.js";
import { pollAll } from "./jobs/pollReviews.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/reviews", reviewsRouter);

await connectDB();

cron.schedule("*/30 * * * *", pollAll);

app.listen(5000, () => console.log("Server running on port 5000"));
