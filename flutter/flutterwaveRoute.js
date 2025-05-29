import express from 'express';
import { flutterwaveWebhook } from './flutterwaveWebhook.js';
import { initiateFlutterwavePayment, initiateOrderPayment, verifyFlutterwaveOrderPayment, verifyFlutterwavePayment } from './flutterwaveController.js';

const flutterwaveRouter = express.Router();

// Handle CORS preflight OPTIONS request for /pay
flutterwaveRouter.options('/pay', (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  });
  return res.sendStatus(200);
});

// Payment initiation route
flutterwaveRouter.post('/pay', initiateFlutterwavePayment);

flutterwaveRouter.post('/cart-checkout', initiateOrderPayment);

flutterwaveRouter.post('/verify', verifyFlutterwavePayment);

flutterwaveRouter.post('/verify-order', verifyFlutterwaveOrderPayment);

// Webhook route (raw body for signature verification)
flutterwaveRouter.post('/webhook', express.raw({ type: '*/*' }), flutterwaveWebhook);

export default flutterwaveRouter;
