import { kitchenNamespace } from "../index.js";
import orderModel from "../models/orderModel.js";
import StockSchema from "../models/StockMovement.js";
import SupplySchema from "../models/SupplyItem.js";
import sendEmail from "../utils/sendEmail.js"; // make sure the path is correct

export const processKitchenOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findById(orderId).populate("menuItems.menu_id");
    if (!order || order.orderStatus !== "On-Progress") {
      return res.status(400).json({ message: "Order not found or already processed." });
    }

    for (const item of order.menuItems) {
      const menu = item.menu_id;

      for (const ing of menu.ingredients) {
        const supply = await SupplySchema.findById(ing.inventoryItem);
        const totalUsed = ing.quantity * item.quantity;

        if (!supply || supply.quantity < totalUsed) {
          return res.status(400).json({ message: `Insufficient stock for ${supply?.name}` });
        }

        // Deduct stock
        supply.quantity -= totalUsed;
        supply.lastUpdated = new Date();
        await supply.save();

        // Log stock movement
        await StockSchema.create({
          supplyItem: supply._id,
          type: "usage",
          quantity: totalUsed,
          notes: `Used for order ${order._id}`,
        });

        // Notify if below reorder point
        if (supply.quantity < supply.reorderPoint) {
          kitchenNamespace.emit("lowStockWarning", {
            supplyItemId: supply._id,
            name: supply.name,
            remaining: supply.quantity,
            unit: supply.unit,
          });

          // Send email alert to admin
          await sendEmail(
            "shittuibrahim092k@gmail.com", // Replace with actual admin email or dynamic lookup
            `⚠️ Low Stock Alert: ${supply.name}`,
            `
              <h2>Low Stock Alert</h2>
              <p><strong>Item:</strong> ${supply.name}</p>
              <p><strong>Remaining:</strong> ${supply.quantity} ${supply.unit}</p>
              <p><strong>Reorder Point:</strong> ${supply.reorderPoint}</p>
              <p>Please restock to avoid running out during service.</p>
            `
          );
        }
      }
    }

    // Mark order as completed
    order.orderStatus = "Completed";
    await order.save();

    kitchenNamespace.emit("orderProcessed", { orderId: order._id, status: "completed" });

    return res.status(200).json({ message: "Order processed successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
