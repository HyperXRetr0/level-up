import { User } from "../models/user.js";
import { Request, Response, NextFunction } from "express";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";

// create user - controller
export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, imgUrl, gender, _id, dob } = req.body;
    console.log({ name, email, imgUrl, gender, _id, dob });
    let user = await User.findById(_id);

    // if user already exists in db - directly login
    if (user)
      return res.status(200).json({
        success: true,
        message: `Welcome, ${user.name}`,
      });

    if (!_id || !name || !email || !imgUrl || !gender || !dob)
      next(new ErrorHandler("All fields are mandatory!", 400));

    user = await User.create({
      name,
      email,
      imgUrl,
      gender,
      _id,
      dob: new Date(dob),
    });
    return res.status(201).json({
      success: true,
      message: `Welcome, ${user.name}`,
    });
  }
);

// get all users - controller
export const getAllUsers = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({});
    return res.status(200).json({
      success: true,
      users,
    });
  }
);

// get user by id - controller
export const getUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandler("No User Found", 400));
    }
    res.status(200).json({
      success: true,
      user,
    });
  }
);

// delete user - controller
export const deleteUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await User.findOneAndDelete({ _id: id });
    if (!user) {
      return next(new ErrorHandler("No User Found", 400));
    }
    res.status(200).json({
      success: true,
      message: `Entry for ${user.name} deleted`,
    });
  }
);
