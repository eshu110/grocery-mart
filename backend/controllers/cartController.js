import User from "../models/User.js"

// ✅ Get User Cart Data : api/cart/get
export const getCart = async (req, res) => {   
  try {
    const userId = req.user._id;   
    const user = await User.findById(userId);   

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      cartItems: user.cartItems || {},   
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Update User CartData : api/cart/update

export const updateCart = async (req, res)=>{
    try {
        console.log("Cart Update Triggered:", req.user);

        const  userId = req.user._id;
        const { cartItems } = req.body;

         const user = await User.findById(userId);
         if (!user) { 
          return res.json({ success: false, message: "User not found" });
         }

         user.cartItems = cartItems;

         await user.save();
        res.json({success: true, message: "Cart Updated", cartItems: user.cartItems});
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
};