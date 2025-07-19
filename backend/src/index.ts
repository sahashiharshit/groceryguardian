import express from "express";
import type { Application } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
//import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";



//Routes
import authenticationRoutes from "./routes/authentication.route.js";
import userRoutes from "./routes/user.route.js";
import householdRoutes from "./routes/householdmanagement.route.js";
import groceryroutes from "./routes/grocerylist.route.js";
import pantryRoutes from "./routes/pantryinventory.route.js";

import { globalErrorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

async function startServer() {
  try {
    //Initialize app
    const app: Application = express();
    const mongoURI = process.env.MONGO_URI!;

    //connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    app.set('trust proxy',1);
    //Global middlewares

    //app.use(helmet());
    app.use(
      cors({
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      })
    );
    app.use(morgan("dev")); // Logging middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    //Rate limiting middleware
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
    });
    app.use(limiter);

    //Api Routes
    app.use("/auth", authenticationRoutes);
    app.use("/users", userRoutes);
    app.use("/households", householdRoutes);
    app.use("/grocery", groceryroutes);
    app.use("/pantry", pantryRoutes);

    app.use(globalErrorHandler);

    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit with failure
  }

}
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  if (reason instanceof Error) {
    console.error('Reason:', reason.message);
    console.error(reason.stack);
  } else {
   
    try {
      console.error('Reason (non-Error):', JSON.stringify(reason, null, 2));
    } catch {
      console.error('Reason (non-Error, non-stringifiable):', reason);
    }
  }
});

startServer();

