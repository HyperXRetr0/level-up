import express from "express";
import { deleteUser, getAllUsers, getUser, newUser, } from "../controllers/user.js";
import { adminAuth } from "../middlewares/auth.js";
const app = express.Router();
// route - /api/v1/user/new
app.post("/new", newUser);
// route - /api/v1/user/all
app.get("/all", adminAuth, getAllUsers);
// route - /api/v1/user/:id
app.route("/:id").get(getUser).delete(adminAuth, deleteUser);
export default app;
