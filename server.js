import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import getUserRoleFromToken from "./utility/getUserRoleFromToken.js";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import getSellerStats from "./utility/getSellerStats.js";
import protect from "./middleware/protect.js";
import getAdminStats from "./utility/getAdminStats.js";
import axios from "axios";

dotenv.config();

const CASHFREE_APP_ID = process.env.CF_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CF_SECRET_KEY;
const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg"; // Use sandbox URL

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/order", orderRoutes);
app.post("/api/v1/get-role", protect, getUserRoleFromToken);
app.get("/api/v1/seller/stats", protect, getSellerStats);
app.get("/api/v1/admin/stats", protect, getAdminStats);
app.post("/api/v1/create-cf-order", async (req, res) => {
  const {
    orderId,
    orderAmount,
    customerEmail,
    customerName,
    customerPhone,
    customerId,
  } = req.body; // Include customerId

  try {
    // Step 1: Get token from Cashfree
    const response = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: customerId, // Use a valid customer ID
          customer_email: customerEmail,
          customer_name: customerName,
          customer_phone: customerPhone,
        },
      },
      {
        headers: {
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
        },
      }
    );

    return res.status(200).json({
      orderToken: response.data.order_token,
      orderId: orderId,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create Cashfree order" });
  }
});

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database Successfully Connected...");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
