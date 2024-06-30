import express from "express";
import {
  deleteOrder,
  getAllOrders,
  getSingleOrder,
  myOrder,
  newOrder,
  processOrder,
} from "../controllers/order.js";
import { adminAuth } from "../middlewares/auth.js";

const app = express.Router();

// route - /api/v1/order/new
app.post("/new", newOrder);

// route - /api/v1/order/my
app.get("/my", myOrder);

// route - /api/v1/order/all
app.get("/all", adminAuth, getAllOrders);

// route - /api/v1/order/:id
app
  .route("/:id")
  .get(getSingleOrder)
  .put(adminAuth, processOrder)
  .delete(deleteOrder);

export default app;
