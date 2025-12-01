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

const app = express();

// 1️⃣ STRIPE WEBHOOK FIRST — RAW BODY
app.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhooks
);

// 2️⃣ Connect DB + cloudinary
await connectDB();
await connectCloudinary();

// 3️⃣ Normal middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// 4️⃣ Routes
app.get('/', (req, res) => {
  res.send('API working...');
});

app.post('/clerk', clerkWebhooks);

app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);

// 5️⃣ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
