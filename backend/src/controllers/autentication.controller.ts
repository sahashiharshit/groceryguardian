

import type { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import { generateAuthToken, generateRefreshToken } from "../services/tokengenerator.service.js";



type RegisterRequestBody = {
  name: string;
  email: string;
  mobileNo: string;
  password: string;

}
type LoginRequestBody = {
  email: string;
  password: string;
}

// Login a user
export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json({ message: "Invalid password" });
    return;
  }
  const id = user.id as string;

  const accessToken = generateAuthToken(id.toString());

  res.cookie("accesstoken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });
  const refreshToken = generateRefreshToken(id.toString());
  res.cookie("refreshtoken", refreshToken, {
    httpOnly: true,
    secure: false, // Use secure cookies in production
    sameSite: 'lax', // Prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 day 
  });
  res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      householdId: user.householdId,
      mobileNo: user.mobileNo,
      createdAt: user.createdAt,

    }
  });
  return;

}
// Register a new user
export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {

  const { name, email, mobileNo, password } = req.body;

  const newUser = {
    name,
    email,
    mobileNo,
    password
  }
  const user = await User.create(newUser);
  const id = user.id.toString() as string;

  const accessToken = generateAuthToken(id);
  res.cookie("accesstoken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });
  const refreshToken = generateRefreshToken(id);
  res.cookie("refreshtoken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax', 
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 day 
  });
  res.status(200).json({
    message: "Signup successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      householdId: user.householdId,
      mobileNo: user.mobileNo,
      createdAt: user.createdAt,

    },
    accessToken
  });

  return;
}

export const refreshToken = async (req: Request, res: Response): Promise<void> => {

  const refreshToken = req.cookies?.refreshtoken;

  if (!refreshToken) {

    res.status(401).json({ message: "No refersh token" });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY!) as { id: string };
    const newAccessToken = generateAuthToken(decoded.id);
    res.cookie('accesstoken', newAccessToken, {

      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15,
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Refresh token invalid:", error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }

};

export const logout = async (req:Request,res:Response):Promise<void> =>{
  
  res.clearCookie('accesstoken',{
  httpOnly:true,
  secure:false,
  sameSite:'lax',
  });
  res.clearCookie('refreshtoken',{
  httpOnly:true,
  secure:false,
  sameSite:'lax',
  });
  res.status(200).json({ message: 'Logged out successfully.' });
}