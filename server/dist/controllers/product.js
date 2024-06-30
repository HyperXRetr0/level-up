import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";
import { rm } from "fs";
import mongoose from "mongoose";
import { nodeCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";
// create product - controller
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, price, stock, category } = req.body;
    console.log({ name, price, stock, category });
    const imgUrl = req.file;
    if (!imgUrl)
        return next(new ErrorHandler("Please upload an image!", 400));
    if (!name || !price || !stock || !category) {
        rm(imgUrl.path, () => {
            console.log("Image Deleted");
        });
        return next(new ErrorHandler("All fields are mandatory!", 400));
    }
    await Product.create({
        name,
        price,
        stock,
        category: category.toLowerCase(),
        imgUrl: imgUrl?.path,
    });
    invalidateCache({ product: true, admin: true });
    return res.status(201).json({
        success: true,
        message: "Product added successfully",
    });
});
// get latest products - controller
export const getLatestProducts = TryCatch(async (req, res, next) => {
    let products;
    if (nodeCache.has("latest-product"))
        products = JSON.parse(nodeCache.get("latest-product"));
    else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
        nodeCache.set("latest-product", JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products,
    });
});
// get all categories - controller
export const getAllCategories = TryCatch(async (req, res, next) => {
    let categories;
    if (nodeCache.has("category"))
        categories = JSON.parse(nodeCache.get("category"));
    else {
        categories = await Product.distinct("category");
        nodeCache.set("category", JSON.stringify(categories));
    }
    return res.status(200).json({
        success: true,
        categories,
    });
});
// get all products - controller
export const getAllProducts = TryCatch(async (req, res, next) => {
    let products;
    if (nodeCache.has("all-product"))
        products = JSON.parse(nodeCache.get("all-product"));
    else {
        products = await Product.find({});
        nodeCache.set("all-product", JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products,
    });
});
// get product by id - controller
export const getProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    // to check if the id is a valid mongoose id
    if (!mongoose.isValidObjectId(id))
        return next(new ErrorHandler("Invalid Id", 400));
    let product;
    if (nodeCache.has(`product-${id}`))
        product = JSON.parse(nodeCache.get(`product-${id}`));
    else {
        product = await Product.findById(id);
        if (!product)
            return next(new ErrorHandler("No Product Found", 404));
        nodeCache.set(`product-${id}`, JSON.stringify(product));
    }
    res.status(200).json({
        success: true,
        product,
    });
});
// delete product by id - controller
export const deleteProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    // to check if the id is a valid mongoose id
    if (!mongoose.isValidObjectId(id))
        return next(new ErrorHandler("Invalid Id", 400));
    const product = await Product.findOneAndDelete({ _id: id });
    if (!product)
        return next(new ErrorHandler("No Product Found", 404));
    if (product) {
        rm(product.imgUrl, () => {
            console.log("Image Deleted");
        });
    }
    invalidateCache({
        product: true,
        productId: String(id),
        admin: true,
    });
    res.status(200).json({
        success: true,
        product,
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
        return next(new ErrorHandler("Invalid Id", 400));
    const { name, price, stock, category } = req.body;
    const imgUrl = req.file;
    const product = await Product.findById(id);
    if (!product)
        return next(new ErrorHandler("No Product Found", 404));
    if (imgUrl) {
        rm(product.imgUrl, () => {
            console.log("Old Image Deleted");
        });
        product.imgUrl = imgUrl.path;
    }
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    if (category)
        product.category = category;
    await product.save();
    invalidateCache({ product: true, productId: String(id), admin: true });
    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully",
    });
});
export const searchAllProducts = TryCatch(async (req, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = limit * (page - 1);
    const baseQuery = {};
    if (search)
        baseQuery.name = {
            $regex: search,
            $options: "i",
        };
    if (price) {
        baseQuery.price = {
            $lte: Number(price),
        };
    }
    if (category) {
        baseQuery.category = category;
    }
    const [products, filteredOnlyProduct] = await Promise.all([
        Product.find(baseQuery)
            .sort(sort ? { price: sort === "asc" ? 1 : -1 } : undefined)
            .limit(limit)
            .skip(skip),
        Product.find(baseQuery),
    ]);
    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);
    return res.status(200).json({
        success: true,
        products,
    });
});
