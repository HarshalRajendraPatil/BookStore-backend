import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(express.json());

app.use("/api/v1/auth", authRoutes);

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database Successfully Connected...");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`); // Log the server URL
    });
  })
  .catch((err) => {
    console.log(err);
  });
