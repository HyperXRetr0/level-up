import express from "express";
import { adminAuth } from "../middlewares/auth.js";
import { getAllProducts, getAllCategories, getLatestProducts, getProduct, newProduct, deleteProduct, updateProduct, searchAllProducts, } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
const app = express.Router();
// route - /api/v1/product/new
app.post("/new", adminAuth, singleUpload, newProduct);
// route - /api/v1/product/latest
app.get("/latest", getLatestProducts);
// route - /api/v1/product/category
app.get("/categories", getAllCategories);
// route - /api/v1/product/all
app.get("/all", searchAllProducts);
// route - /api/v1/product/admin-products
app.get("/admin-products", getAllProducts);
// route - /api/v1/product/:id
app
    .route("/:id")
    .get(getProduct)
    .delete(adminAuth, deleteProduct)
    .put(adminAuth, singleUpload, updateProduct);
export default app;
