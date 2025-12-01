import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './configs/mongodb.js';
import connectCloudinary from './configs/cloudinary.js';

import { clerkMiddleware } from '@clerk/express';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';

import educatorRouter from './routes/educatorRoutes.js';
import courseRouter from './routes/courseRoutes.js';
import userRouter from './routes/userRoutes.js';

// Vercel / Serverless needs this for Stripe raw body
export const config = {
  api: { bodyParser: false }
};

// Initialize express
const app = express();

// 1️⃣ STRIPE WEBHOOK MUST BE FIRST (raw body, no JSON)
app.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhooks
);

// 2️⃣ Connect database & cloudinary
await connectDB();
await connectCloudinary();

// 3️⃣ STANDARD MIDDLEWARE (after raw route)
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// 4️⃣ ROUTES
app.get('/', (req, res) => {
  res.send("API working...");
});

app.post('/clerk', clerkWebhooks);

app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);

// 5️⃣ START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
