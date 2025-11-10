import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {type: String, require: true},
    description: {type: Array, require: true},
    price: {type: Number, require: true},
    offerPrice: {type: Number, require: true},
    image: {type: Array, require: true},
    category: {type: String, require: true},
    inStock: {type: Boolean, default: true },
    bestSeller: { type: Boolean, default: false }
}, {timestamps: true})

const Product = mongoose.models.product || mongoose.model('product', productSchema)

export default Product;