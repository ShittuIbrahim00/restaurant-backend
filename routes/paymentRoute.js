import express from "express";
import { createStripePaymentIntent } from "../controllers/controllerForPayment.js";

const paymentRouter = express.Router();

paymentRouter.post("/pay", createStripePaymentIntent);

export default paymentRouter;
