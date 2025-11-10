import express from "express";
import authUser from "../middleware/authUser.js";
import { updateCart, getCart } from "../controllers/cartController.js";


const cartRouter = express.Router();

cartRouter.get('/get', authUser, getCart);
cartRouter.post('/update', authUser, updateCart)

export default cartRouter;