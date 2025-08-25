
import type { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import { generateAuthToken, generateRefreshToken } from "../services/tokengenerator.service.js";
import mongoose from "mongoose";
import { generateNumericOtp, hashOtp, verifyOtp as verifyOtpUtil } from "../utils/otp.js";
import VerificationToken from "../models/VerificationToken.js";
import { sendResetPasswordOtpEmail, sendSignupOtpEmail } from "../services/mailer.service.js";


type RegisterRequestBody = {
  name: string;
  email: string;
  password: string;

}
type LoginRequestBody = {
  email: string;
  password: string;
}

function setAuthCookies(res: Response, userId: string) {

  const accessToken = generateAuthToken(userId);
  const refershToken = generateRefreshToken(userId);
  res.cookie("accesstoken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  });
  res.cookie("refreshtoken", refershToken, {
    httpOnly: true,
    secure: true, // Use secure cookies in production
    sameSite: 'lax', // Prevent CSRF attacks
    path: '/',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
};

export const verifySignup = async (req: Request<{}, {}, { email: string; otp: string }>, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) { res.status(400).json({ message: "Missing fields" }); return; }
  const user = await User.findOne({ email });
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  const tokenDoc = await VerificationToken.findOne({ userId: user._id, type: "signup" });
  if (!tokenDoc) { res.status(400).json({ message: "Invalid or expired code" }); return; }
  if (tokenDoc.expiresAt.getTime() < Date.now()) {
    await tokenDoc.deleteOne();
    res.status(400).json({ message: "Code expired" });
    return;
  }

  const isValid = await verifyOtpUtil(otp, tokenDoc.otp);
  if (!isValid) {
    res.status(400).json({ message: "Invalid code" });
    return;
  }
  // mark user verified
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $set: { emailVerified: true, emailVerifiedAt: new Date() } },
    { new: true }
  );
  // delete token after success (defense-in-depth)
  await tokenDoc.deleteOne();

  if (!updatedUser) { res.status(404).json({ message: "User not found" }); return; }

  // now issue login cookies (or you can require explicit login afterwards)
  setAuthCookies(res, (user._id as mongoose.Types.ObjectId).toString());

  res.json({
    message: "Email verified successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
  });
  return;
};

export const resendSignupOtp = async (req: Request<{}, {}, { email: string }>, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  if (user.emailVerified) { res.status(400).json({ message: "User already verified" }); return; }

  const otp = generateNumericOtp(6);
  const otphash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  await VerificationToken.findOneAndUpdate({ userId: user._id, type: "signup" },
    { otp: otphash, type: "signup", userId: user._id, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true });

  await sendSignupOtpEmail(user.email, user.name, otp);
  res.status(200).json({ message: "Verification code resent" });
  return;
};

// Register a new user
export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: "Name, email and password are required" });
    return;
  }
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ message: "User already exists" });
    return;
  }

  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    const created = new User({ name, email, password });
    await created.save({ session });
    // generate otp and send email
    const otp = generateNumericOtp(6);
    const otphash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await VerificationToken.findOneAndUpdate(
      { userId: created._id, type: "signup" },
      { otp: otphash, type: "signup", userId: created._id, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true, session }
    );

    await sendSignupOtpEmail(created.email, created.name, otp);
    res.status(201).json({
      message: "User created. Verification code sent to email.",
      user: {
        _id: created._id,
        name: created.name,
        email: created.email,
        emailVerified: created.emailVerified,
        createdAt: created.createdAt,
      },
    });
  });
  session.endSession();
};

// Login a user
export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(404);
    throw new Error("Invalid password");
  }
  if (!user.emailVerified) {
    res.status(403);
    throw new Error("Email not verified");
  }

  setAuthCookies(res, (user._id as mongoose.Types.ObjectId).toString());
  res.status(200).json({
    message: "Logged in",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
  });
  return;

};

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
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Refresh token invalid:", error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }

};

export const logout = async (req: Request, res: Response): Promise<void> => {

  res.clearCookie('accesstoken', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  res.clearCookie('refreshtoken', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully.' });
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.id;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const matchPassword = await user.comparePassword(oldPassword);
  if (!matchPassword) {
    res.status(401).json({ message: "Old password is incorrect" });
    return;
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({ message: "Password changed successfully" });
  return;
}


export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    return;
  }

  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    const user = await User.findOne({ email }).session(session);
    if (!user) {
      res.status(400).json({ message: 'User not found.' });
      return;
    }
    const tokenDoc = await VerificationToken.findOne({ userId: user._id, type: "reset" }).session(session);
    if (!tokenDoc) {
      res.status(400).json({ message: 'No OTP found.' });
      return;
    }
    if (tokenDoc.expiresAt.getTime() < Date.now()) {
      await tokenDoc.deleteOne({ session });
      res.status(400).json({ message: 'OTP expired.' });
      return;
    }
    const isValid = await verifyOtpUtil(otp, tokenDoc.otp);
    if (!isValid) {
      res.status(400).json({ message: 'Invalid OTP.' });
      return;
    }
    user.password = password;
    await user.save({ session });
    await tokenDoc.deleteOne({ session });
    res.status(200).json({ message: 'Password has been reset successfully.' });
  });
  session.endSession();
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: 'Email is required.' });
    return;
  }

  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    const user = await User.findOne({ email }).session(session);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    const otp = generateNumericOtp(6);
    const name = user?.name;
    await sendResetPasswordOtpEmail(email, name, otp);
    const otphash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await VerificationToken.findOneAndUpdate(
      { userId: user._id, type: "reset" },
      { otp: otphash, type: "reset", userId: user._id, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true, session }
    );
    res.status(200).json({ message: 'Password reset Otp sent to your Email.' });
  });
  session.endSession();
}
