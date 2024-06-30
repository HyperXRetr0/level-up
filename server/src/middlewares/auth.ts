import { Request, Response, NextFunction } from "express";
import { TryCatch } from "./error.js";
import ErrorHandler from "../utils/utility-class.js";
import { User } from "../models/user.js";

// middleware to authorize the admin
export const adminAuth = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;
    if (!id) return next(new ErrorHandler("Please login", 401));
    const user = await User.findById(id);
    if (!user) return next(new ErrorHandler("No user found", 401));
    if (user.role !== "admin")
      return next(new ErrorHandler("Administrator Permissions not Found", 403));
    next();
  }
);
