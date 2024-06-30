import express from "express";
import {
  applyDiscount,
  createPayment,
  deleteCoupon,
  getAllCoupons,
  newCoupon,
} from "../controllers/payment.js";
import { adminAuth } from "../middlewares/auth.js";

const app = express.Router();

// /api/v1/payment/create
app.post("/create", createPayment);

// /api/v1/payment/coupon/new
app.post("/coupon/new", adminAuth, newCoupon);

// /api/v1/payment/discount
app.get("/discount", applyDiscount);

// /api/v1/payment/coupon/all
app.get("/coupon/all", adminAuth, getAllCoupons);

// /api/v1/payment/coupon/:id
app.route("/coupon/:id").delete(adminAuth, deleteCoupon);

export default app;
