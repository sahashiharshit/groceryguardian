

import mongoose, { Types } from "mongoose";
import User from "../models/User.js";
import Household from "../models/Household.js";
import type { Request, Response } from "express";

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }
  const userinfo = await User.findById(userId);

  if (!userinfo) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({
    user: {
      id: userinfo._id,
      name: userinfo.name,
      email: userinfo.email,
      createdAt: userinfo.createdAt,
      household: userinfo.householdId,
      mobileNo: userinfo.mobileNo
    },
  });
};


export const createGroup = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;
  const { name } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  if (user.householdId) {
    res.status(400).json({ message: "User belongs to a household" });
    return;
  }

  const newGroup = new Household({
    name,
    members: [{ userId: userId, role: "owner" }],
  });
  await newGroup.save();
  user.householdId = newGroup._id as Types.ObjectId;
  await user.save();

  res.status(200).json({ message: "New Group Created", group: newGroup });
  return;
};

export const getGroupUsersList = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const user = await User.findById({ userId }).populate({
    path: "household",
    populate: {
      path: "members.userId",
      model: "User",
      select: "name email",
    },

  });
  if (!user || !user.householdId) {
    res.status(404).json({ message: "No household found" });
    return;
  }
  res.status(200).json({ household: user?.householdId });
  return;
};



export const updateUserInfo = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { name,mobileNo } = req.body;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  user.name = name ?? user.name;
  user.mobileNo = mobileNo ?? user.mobileNo;
  await user.save();
  
  res.status(200).json({
    message: "User info updated successfully",
    user: {
      name: user.name,
      mobileNo: user.mobileNo,
      email: user.email,
      id: user._id,
    },
  });
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // If user is part of a household, check ownership
  if (user.householdId) {
    const household = await Household.findById(user.householdId);
    if (household) {
      // Find all owners in the household
      const owners = household.members.filter(
        (member) => member.role === "owner"
      );
      // Check if user is an owner
      const isOwner = household.members.some(
        (member) => member.userId.toString() === userId && member.role === "owner"
      );
      // If user is the only owner, prevent deletion
      if (isOwner && owners.length === 1) {
        res.status(400).json({ error: "Cannot delete account. You are the only owner of the group." });
        return;
      }
      // Remove user from household members
      household.members = household.members.filter(
        (member) => member.userId.toString() !== userId
      );
      await household.save();
    }
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({ message: "User account deleted successfully" });
};