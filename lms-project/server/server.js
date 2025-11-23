import express from 'express';
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';

//initialize express
const app = express();

//connect to database
await connectDB();

//add middleware
app.use(cors());
app.use(clerkMiddleware());

//routes
app.get('/',(req,res)=>{
    res.send("api working...");
})
app.post('/clerk',express.json(), clerkWebhooks);
app.use('/api/educator', express.json(), educatorRouter);





//port
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`server is running at port ${PORT}`);
})