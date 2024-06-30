import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";
import mongoose from "mongoose";
import { stripe } from "../app.js";
export const createPayment = TryCatch(async (req, res, next) => {
    const { amount } = req.body;
    if (!amount)
        return next(new ErrorHandler("Please Enter Amount", 404));
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount * 100),
        currency: "inr",
    });
    return res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
    });
});
export const newCoupon = TryCatch(async (req, res, next) => {
    const { coupon, amount } = req.body;
    if (!coupon || !amount)
        return next(new ErrorHandler("Empty Fields", 400));
    await Coupon.create({ code: coupon, amount });
    return res.status(201).json({
        success: true,
        message: `Coupon ${coupon} Created Successfully`,
    });
});
export const applyDiscount = TryCatch(async (req, res, next) => {
    const { coupon } = req.query;
    const discount = await Coupon.findOne({ code: coupon });
    if (!discount)
        return next(new ErrorHandler("Invalid Coupon Code", 400));
    return res.status(200).json({
        success: true,
        discount: discount.amount,
    });
});
export const getAllCoupons = TryCatch(async (req, res, next) => {
    const coupons = await Coupon.find({});
    return res.status(201).json({
        success: true,
        coupons,
    });
});
export const deleteCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
        return next(new ErrorHandler("Invalid Id", 400));
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon)
        return next(new ErrorHandler("Invalid Coupon", 400));
    return res.status(201).json({
        success: true,
        message: "Coupon successfully deleted",
    });
});
