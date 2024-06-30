import mongoose, { Document } from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { nodeCache } from "../app.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";

export const connectDb = (uri: string) => {
  // const MONGO_URI =
  //   "mongodb+srv://guptamayank2003:1234@levelup.rxasyvv.mongodb.net/?retryWrites=true&w=majority&appName=LevelUp";
  mongoose
    .connect(uri, {
      dbName: "LevelUp",
    })
    .then((c) => console.log(`DB Connected to ${c.connection.host}`))
    .catch((error) => console.log(error));
};

export const invalidateCache = ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}: InvalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = ["latest-product", "all-product", "category"];
    if (typeof productId === "string") productKeys.push(`product-${productId}`);
    if (typeof productId === "object")
      productId.forEach((i) => productKeys.push(`product-${i}`));
    nodeCache.del(productKeys);
  }
  if (order) {
    const orderKeys: string[] = [
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

export const reduceStock = (orderItems: OrderItemType[]) => {
  orderItems.map(async (order) => {
    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product Not Found");
    product.stock -= order.quantity;
    await product.save();
  });
};

export const calculatePercentage = (
  currentMonthNumbers: number,
  prevMonthNumbers: number
) => {
  if (prevMonthNumbers === 0) return currentMonthNumbers * 100;
  return Number(((currentMonthNumbers / prevMonthNumbers) * 100).toFixed(0));
};

export const getInventory = async (
  productCategories: string[],
  productCount: number
) => {
  const productCategoryCountPromise = productCategories.map((category) =>
    Product.countDocuments({ category })
  );
  const categoryCount = await Promise.all(productCategoryCountPromise);
  const categoryData: Record<string, number>[] = [];
  productCategories.forEach((category, i) => {
    categoryData.push({
      [category]: Math.round((categoryCount[i] / productCount) * 100),
    });
  });
  return categoryData;
};

interface curDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}

export const prevMonthsData = (
  length: number,
  doc: curDocument[],
  currentDate: Date,
  property?: "discount" | "total"
) => {
  const data = new Array(length).fill(0);
  doc.forEach((i) => {
    const createdAt = i.createdAt;
    const deltaMonth =
      (currentDate.getMonth() - createdAt.getMonth() + 12) % 12;
    if (deltaMonth < length) {
      data[length - 1 - deltaMonth] += property ? i[property] : 1;
    }
  });
  return data;
};
