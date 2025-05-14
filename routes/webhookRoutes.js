import express from "express";
import { stripeWebhookHandler } from "../controllers/webhookController";

const stripeRouter = express.Router();

// Stripe Webhook endpoint
stripeRouter.post("/stripe", express.raw({ type: "application/json" }), stripeWebhookHandler);

export default stripeRouter;
