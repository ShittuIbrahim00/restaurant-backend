import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

export const initiateFlutterwavePayment = async (req, res) => {
  const { email, amount, userId, tableId, qty_persons } = req.body;

  try {
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: `tx-${Date.now()}`,
        amount,
        currency: "NGN",
        redirect_url: "http://localhost:5173/payment-success",
        customer: { email },
        customizations: {
          title: "Table Reservation",
          description: "Payment for table reservation",
        },
        meta: { userId, tableId, qty_persons },
      },
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({ link: response.data.data.link });
  } catch (error) {
    console.error("Flutterwave error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};
