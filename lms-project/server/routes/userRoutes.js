import express from "express";
import { getUserData, purchseCourse, userEnrolledCourses } from "../controllers/userController.js";

import { Purchase } from "../models/Purchase.js";
const userRouter = express.Router();

userRouter.get("/data",getUserData)
userRouter.get("/enrolled-courses", userEnrolledCourses)
userRouter.post('/purchase',purchseCourse)

export default userRouter;