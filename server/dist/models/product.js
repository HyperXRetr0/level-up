import mongoose from "mongoose";
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name"],
    },
    imgUrl: {
        type: String,
        required: [true, "Please add the image URL"],
    },
    price: {
        type: Number,
        required: [true, "Please add product price"],
    },
    stock: {
        type: Number,
        required: [true, "Please add product stock"],
    },
    category: {
        type: String,
        required: [true, "Please add product category"],
        trim: true,
    },
}, { timestamps: true });
export const Product = mongoose.model("Product", schema);
