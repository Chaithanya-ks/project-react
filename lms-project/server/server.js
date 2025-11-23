import express from 'express';
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js';
import { cllerkWebhooks } from './controllers/webhooks.js';

//initialize express
const app = express();

//connect to database
await connectDB();

//add middleware
app.use(cors());

//routes
app.get('/',(req,res)=>{
    res.send("api working...");
})
app.post('/clerk',express.json(), cllerkWebhooks)





//port
const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{
    console.log(`server is running at port ${PORT}`);
})