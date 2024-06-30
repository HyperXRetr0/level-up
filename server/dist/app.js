import express from "express";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import statsRoutes from "./routes/statistics.js";
import { connectDb } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
config({
    path: "./.env",
});
const port = process.env.PORT || 4000;
connectDb(process.env.MONGO_URI || "");
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const nodeCache = new NodeCache();
// user routes
app.use("/api/v1/user", userRoutes);
// product routes
app.use("/api/v1/product", productRoutes);
// order routes
app.use("/api/v1/order", orderRoutes);
// payment routes
app.use("/api/v1/payment", paymentRoutes);
//stats routes
app.use("/api/v1/dashboard", statsRoutes);
app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});
