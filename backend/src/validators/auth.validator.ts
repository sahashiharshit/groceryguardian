
import type{ Request, Response, NextFunction } from "express";

export const validateRegister = (req:Request, res:Response, next:NextFunction):void => {
  // Middleware to validate user registration input
  const { name, email, password } = req.body;
 
  // Check if all fields are provided
  if (!name || !email || !password) {
     res.status(400).json({ message: "All fields are required" });
     return
  }

  // Check if name is at least 3 characters long
  if (name.trim().length < 3) {
   res.status(400)
      .json({ message: "Name must be at least 3 characters long" });
      
    return;
  }

  // Simple email regex for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
     res.status(400).json({ message: "Invalid email format" });
    return;
  }

  // Check if password is at least 8 characters long
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  
  if (!password || !passwordRegex.test(password)) {
     res
      .status(400)
      .json({
        error:
          "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.",
      });
      return;
  }

  next();
};

export const validateLogin = (req:Request, res:Response, next:NextFunction):void => {
const { email, password } = req.body;

 if (!email || !password) {
     res.status(400).json({ message: "Email and password are required" });
    return;
  }
  
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
     res.status(400).json({ message: "Invalid email format" });
     return;
  }
next();

}