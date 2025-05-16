import express from 'express';
import { initiateFlutterwavePayment } from './flutterwaveController.js';
import { flutterwaveWebhook } from './flutterwaveWebhook.js';

const flutterwaveRouter = express.Router();

flutterwaveRouter.post('/pay', initiateFlutterwavePayment);
flutterwaveRouter.post('/webhook', express.raw({ type: '*/*' }), flutterwaveWebhook);

export default flutterwaveRouter;
