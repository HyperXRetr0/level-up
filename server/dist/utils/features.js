import mongoose from "mongoose";
import { nodeCache } from "../app.js";
import { Product } from "../models/product.js";
export const connectDb = (uri) => {
    // const MONGO_URI =
    //   "mongodb+srv://guptamayank2003:1234@levelup.rxasyvv.mongodb.net/?retryWrites=true&w=majority&appName=LevelUp";
    mongoose
        .connect(uri, {
        dbName: "LevelUp",
    })
        .then((c) => console.log(`DB Connected to ${c.connection.host}`))
        .catch((error) => console.log(error));
};
export const invalidateCache = ({ product, order, admin, userId, orderId, productId, }) => {
    if (product) {
        const productKeys = ["latest-product", "all-product", "category"];
        if (typeof productId === "string")
            productKeys.push(`product-${productId}`);
        if (typeof productId === "object")
            productId.forEach((i) => productKeys.push(`product-${i}`));
        nodeCache.del(productKeys);
    }
    if (order) {
        const orderKeys = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`,
        ];
        nodeCache.del(orderKeys);
    }
    if (admin) {
        nodeCache.del([
            "admin-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-line-charts",
        ]);
    }
};
export const reduceStock = (orderItems) => {
    orderItems.map(async (order) => {
        const product = await Product.findById(order.productId);
        if (!product)
            throw new Error("Product Not Found");
        product.stock -= order.quantity;
        await product.save();
    });
};
export const calculatePercentage = (currentMonthNumbers, prevMonthNumbers) => {
    if (prevMonthNumbers === 0)
        return currentMonthNumbers * 100;
    return Number(((currentMonthNumbers / prevMonthNumbers) * 100).toFixed(0));
};
export const getInventory = async (productCategories, productCount) => {
    const productCategoryCountPromise = productCategories.map((category) => Product.countDocuments({ category }));
    const categoryCount = await Promise.all(productCategoryCountPromise);
    const categoryData = [];
    productCategories.forEach((category, i) => {
        categoryData.push({
            [category]: Math.round((categoryCount[i] / productCount) * 100),
        });
    });
    return categoryData;
};
export const prevMonthsData = (length, doc, currentDate, property) => {
    const data = new Array(length).fill(0);
    doc.forEach((i) => {
        const createdAt = i.createdAt;
        const deltaMonth = (currentDate.getMonth() - createdAt.getMonth() + 12) % 12;
        if (deltaMonth < length) {
            data[length - 1 - deltaMonth] += property ? i[property] : 1;
        }
    });
    return data;
};
