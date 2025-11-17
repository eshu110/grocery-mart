import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({children}) => {

    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
    
    // ✅ Change: Load cart from localStorage initially
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem("cartItems");
        return savedCart ? JSON.parse(savedCart) : {};
    });

    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Seller Status
    const fetchSeller = async () => {
        try {
            const { data } = await axios.get('/api/seller/is-auth', { withCredentials: true });
            if(data.success){
                setIsSeller(true);
                localStorage.setItem('isSeller', 'true');
            } else {
                setIsSeller(false);
                localStorage.removeItem('isSeller');
            }
        } catch (error) {
            setIsSeller(false);
            localStorage.removeItem('isSeller');
        }
    }

    //Fetch User Auth Status, user Data And cart Items
    const fetchUser = async () => {
        try {
            const {data} = await axios.get('/api/user/is-auth',{
                withCredentials: true,
                headers: {
                   Authorization: `Bearer ${localStorage.getItem("token")}`
              }
            });
            
            if (data.success){
                setUser(data.user)
                
                // ✅ Change: Merge backend cart with localStorage cart
                setCartItems(prevCart => ({ ...prevCart, ...(data.user.cartItems || {}) }));
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null)
        }
    };

    // ✅ NEW FUNCTION — Fetch Cart Data From Backend
    const fetchCart = async () => {   
        try {
            const { data } = await axios.get("/api/cart/get");
            if (data.success) {
                setCartItems(prevCart => ({ ...prevCart, ...(data.cartItems || {}) }));
            }
        } catch (error) {
            console.log("Error loading cart:", error.message);
        }
    };

    // Fetch All Products
    const fetchProducts = async ()=> {
        try {
            const {data} = await axios.get('/api/product/list');
            if(data.success){
                setProducts(data.products);
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Add Product to Cart
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] += 1;
        } else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        toast.success("Added to Cart");
    }

    //Update Cart Item Quantity
    const updateCartItem = (itemId, Quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = Quantity;
        setCartItems(cartData)
        toast.success("Cart Updated")
    }

    //Remove Products From Cart
    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] -= 1;
            if(cartData[itemId] === 0){
                delete cartData[itemId];
            }
        }
        setCartItems(cartData)
        toast.success("Removed From Cart")
    }

    //Get Cart Item Count 
    const getCartCount = () => {
        let totalCount = 0;
        for(const item in cartItems){
            totalCount += cartItems[item];
        }
        return totalCount;
    }

    //Get Cart Total Amount 
    const getCartAmount = () => {
        let totalAmount = 0;
        for(const item in cartItems){
            let itemInfo = products.find((product)=> product._id === item);
            if(cartItems[item] > 0 && itemInfo){
                totalAmount += itemInfo.offerPrice * cartItems[item];
            }
        } 
        return Math.floor(totalAmount * 100) / 100;
    }

    const logoutSeller = () => {
        setIsSeller(false);
        localStorage.removeItem('isSeller'); 
        navigate('/seller/login');
    }

    // ✅ First effect: load user, seller, and products once
    useEffect(() => {   
        fetchUser();
        fetchSeller();
        fetchProducts();
    }, []);

    // ✅ Second effect: when user available, then load cart
    useEffect(() => {   
        if (user) {
            fetchCart();
        }
    }, [user]); 

    // Update Database Cart Items
    useEffect(() => {
        const updateCart = async () => {
            try {
                const {data} = await axios.post('/api/cart/update', {
                    cartItems,
                    userId: user?._id,
                });
                if (!data.success){
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        };

        if(user){   
            updateCart();
        }
    }, [cartItems]);

    // ✅ Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    const value = {
        navigate, user, setUser,
        isSeller, setIsSeller,
        logoutSeller,
        showUserLogin, setShowUserLogin,
        products, currency,
        addToCart, updateCartItem, removeFromCart,
        cartItems, searchQuery, setSearchQuery,
        getCartAmount, getCartCount, axios, fetchProducts,setCartItems
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext)
}
