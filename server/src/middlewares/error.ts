import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/utility-class.js";
import { ControllerType } from "../types/types.js";

// error middleware
// defined a basic error layout
// we can pass an error, but if there is any unknown error - it is handled with an internal server error
export const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

// error handler - wrapper
// made so that we don't have to write the try-catch block in controllers whenever we make a new controller
export const TryCatch =
  (func: ControllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };
