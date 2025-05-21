import Order from "../models/orderModel.js";
import Menu from "../models/menuModel.js";
import User from "../models/userModel.js"

//Place an Order

export const placeOrder = async (req,res) => {
    try {
        const {customer_id, menuItems, orderType,tableNumber, address} =req.body;

        //Basic Validation

        if(!customer_id || !menuItems || !orderType){
            return res.status(400).json({message:"Missing required fields"});
        }

        //Fetch menu items once
        const menuIds = menuItems.map(item=>item.menu_id);
        const menus = await Menu.find({_id:{$in:menuIds}, availability:true});

        if(menus.length !== menuItems.length){
            return res.status(404).json({message:"Some menu items are unavailable or not found"});
        }

        let totalAmount=0;
        menuItems.forEach(item => {
            const menu = menus.find(m=>m._id.toString() === item.menu_id);
            if(menu){
                totalAmount += menu.price * item.quantity;
            }
        });

        const newOrder = new Order({
            customer_id,
            menuItems,
            orderType,
            tableNumber:orderType === "Dine-in" ? tableNumber : undefined,
            address: orderType === "Delivery" ? address : undefined,
            totalAmount,
            orderStatus: "Pending",
            paymentStatus:"Pending"
        });

        await newOrder.save();

        return res.status(201).json({message:"Order Placed successfully", order: newOrder});
    } catch (error) {
        console.log("Error placing order", error);
        return res.status(500).json({message:"Internal Server Error"})
    }
};

export const getCustomerOrders = async (req,res) => {
    try {
        const {customerId} = req.params;

        const orders = await Order.find({customer_id: customerId}).populate("menuItems.menu_id", "name price").sort({createdAt: -1});

        if(!orders.length){
            return res.status(404).json({message: "No orders found for this customer"});

        }
        res.status(200).json({orders});
    } catch (error) {
        console.error("Error fetching customers orders", error);
        res.status(500).json({message:"Internal server error"});
    }
};


export const updateOrderStatus = async (req, res) => {
    try {
        const {orderId} = req.params;
        const {orderStatus, paymentStatus} = req.body;

        const order = await Order.findById(orderId);

        if(!order){
            return res.status(404).json({message:"Order not found"});
        }

        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();

        res.status(200).json({message: "Order status updated", order});
    } catch (error) {
        console.error("Admin failed to update order", error);
        res.status(500).json({message: "Internal server error"})
    }
}

export const getAllOrders = async(req, res)=>{
    try {
        const orders = await Order.find()
        .populate("customer_id", "name email") 
        .populate("menuItems.menu_id", "name");
  
        res.status(200).json({success:true, message:"All Orders", orders})
    } catch (err) {
        console.error("Error fetching orders", err);
        res.status(500).json({message:"Internal server error"});
    }
}