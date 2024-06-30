import { TryCatch } from "../middlewares/error.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import { Order } from "../models/order.js";
import ErrorHandler from "../utils/utility-class.js";
import { nodeCache } from "../app.js";
import mongoose from "mongoose";
export const newOrder = TryCatch(async (req, res, next) => {
    const { shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, total, } = req.body;
    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total) {
        return next(new ErrorHandler("Empty Fields", 400));
    }
    await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    });
    await reduceStock(orderItems);
    invalidateCache({
        product: true,
        order: true,
        admin: true,
        userId: user,
    });
    return res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
    });
});
export const myOrder = TryCatch(async (req, res, next) => {
    const { id } = req.query;
    let orders = [];
    if (nodeCache.has(`my-orders-${id}`))
        orders = JSON.parse(nodeCache.get(`my-orders-${id}`));
    else {
        orders = await Order.find({ user: id });
        nodeCache.set(`my-orders-${id}`, JSON.stringify(orders));
    }
    return res.status(200).json({
        success: true,
        orders,
    });
});
export const getAllOrders = TryCatch(async (req, res, next) => {
    let orders = [];
    if (nodeCache.has("all-orders"))
        orders = JSON.parse(nodeCache.get("all-orders"));
    else {
        orders = await Order.find().populate("user", "name");
        nodeCache.set("all-orders", JSON.stringify(orders));
    }
    return res.status(200).json({
        success: true,
        orders,
    });
});
export const getSingleOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
        return next(new ErrorHandler("Invalid Id", 400));
    let order;
    if (nodeCache.has(`order-${id}`))
        order = JSON.parse(nodeCache.get(`order-${id}`));
    else {
        order = await Order.findById(id).populate("user", "name");
        if (!order)
            return next(new ErrorHandler("Order not found", 404));
        nodeCache.set(`order-${id}`, JSON.stringify(order));
    }
    return res.status(200).json({
        success: true,
        order,
    });
});
export const processOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
        return next(new ErrorHandler("Invalid Id", 400));
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order not found", 404));
    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;
        default:
            order.status = "Delivered";
            break;
    }
    await order.save();
    invalidateCache({
        product: false,
        admin: true,
        order: true,
        userId: order.user,
        orderId: id,
        productId: order.orderItems.map((i) => String(i.productId)),
    });
    return res.status(200).json({
        success: true,
        message: "Order Processed Successfully",
    });
});
export const deleteOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
        return next(new ErrorHandler("Invalid Id", 400));
    const order = await Order.findOneAndDelete({ _id: id });
    if (!order)
        return next(new ErrorHandler("Order not Found", 404));
    invalidateCache({
        product: false,
        admin: true,
        order: true,
        userId: order.user,
        orderId: id,
    });
    return res.status(200).json({
        success: true,
        message: "Order Deleted Successfully",
    });
});
