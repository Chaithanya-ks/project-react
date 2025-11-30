import {Webhook } from "svix";
import User from "../models/User.js";
import { response } from "express";
import Stripe from 'stripe';
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

//API controller function to manage clerk user with database

export const clerkWebhooks = async (req,res)=>{
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        await whook.verify(JSON.stringify(req.body),{
            "svix-id":req.headers["svix-id"],
            "svix-timestamp":req.headers["svix-timestamp"],
            "svix-signature":req.headers["svix-signature"]
        })

        const {data, type} =req.body;

        switch(type)
        {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email:data.email_addresses[0].email_address,
                    name:data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }

                await User.create(userData);
                res.json({})
                break;
            }

            case 'user.updated':{
                const userData = {
                    email:data.email_address[0].email_address,
                    name:data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }

                await User.findByIdAndUpdate(data.id, userData);
                res.json({});
                break;
            }

            case 'user.deleted':{
                await User.findByIdAndDelete(data.id);
                res.json({});
                break;
            }

            default:
                break;

        }
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY) 

export const stripeWebhooks = async(request, response) => {
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET   // FIXED
        );
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`); 
    }

    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntent.id
            });

            const { purchaseId } = session.data[0].metadata;
            const purchase = await Purchase.findById(purchaseId);
            const user = await User.findById(purchase.userId);
            const course = await Course.findById(purchase.courseId.toString());

            course.enrolledStudents.push(user._id);
            await course.save();

            user.enrolledCourses.push(course._id);
            await user.save();

            purchase.status = 'completed';
            await purchase.save();

            break;
        }

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntent.id
            });

            const { purchaseId } = session.data[0].metadata;
            const purchase = await Purchase.findById(purchaseId);

            purchase.status = 'failed';
            await purchase.save();

            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return response.json({ received: true });
};
