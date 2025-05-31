import User from "../models/User.js";
import { genrateAuthToken } from "../services/tokengenerator.service.js";

// Login a user
export const login = async(req, res) => {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
          
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }  
      const isMatch = await user.comparePassword(password);
       if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" }); 
       } 
     const token = genrateAuthToken(user);
     res.cookie("token",token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "Strict", // Prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 day 
     });
     res.status(200).json({
        message: "Login successful",
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        token
    });
    
}
// Register a new user
export const register = async(req, res) => {

const { name, email, password } = req.body;

const newUser = {
    name,
    email,
    password
    }
  await User.create(newUser); 
  res.status(201).json({message: "User registered successfully", user: newUser});
}
