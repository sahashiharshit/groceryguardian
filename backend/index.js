import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";


//Routes
import authenticationRoutes from "./routes/authentication.route.js";
 import userRoutes from "./routes/user.route.js";
// import householdRoutes from "./routes/householdmanagement.routes.js";
import groceryroutes from "./routes/grocerylist.route.js";
// import pantryRoutes from "./routes/pantryinventory.route.js";
// import notificationRoutes from "./routes/notifications.route.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

//Initialize app
const app = express();
dotenv.config();

//connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });


//Global middlewares

//app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
//app.use(morgan("dev")); // Logging middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalErrorHandler);

//Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

//Api Routes
app.use("/api/auth", authenticationRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/households", householdRoutes);
app.use("/api/grocery", groceryroutes);
// app.use("/api/pantry", pantryRoutes);
// app.use("/api/notifications", notificationRoutes);

const PORT  = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));