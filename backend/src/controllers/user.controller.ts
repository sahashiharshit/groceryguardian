

import mongoose, { Types } from "mongoose";
import User from "../models/User.js";
import Household from "../models/Household.js";
import type { Request,Response } from "express";

export const getUser = async (req:Request, res:Response):Promise<void> => {
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
    },
  });
};


export const createGroup = async (req:Request, res:Response):Promise<void> => {
  const userId = req.params.id;
  const { name } = req.body;
  const user = await User.findById(userId);
  if (!user) {
  res.status(404).json({ message: "User not found" });
  return;
  } 
  if (user.household) {
     res.status(400).json({ message: "User belongs to a household" });
     return;
  }

  const newGroup = new Household({
    name,
    members: [{ userId: userId, role: "owner" }],
  });
  await newGroup.save();
  user.household = newGroup._id as Types.ObjectId;
  await user.save();

  res.status(200).json({ message: "New Group Created", group: newGroup });
  return;
};

export const getGroupUsersList = async (req:Request, res:Response):Promise<void> => {
  const userId = req.user?.id;
  const user = await User.findById({ userId }).populate({
  path:"household",
  populate:{
    path:"members.userId",
    model:"User",
    select: "name email",
    },
  
  });
   if (!user || !user.household) {
     res.status(404).json({ message: "No household found" });
     return;
  }
  res.status(200).json({household: user?.household });
  return;
};

export const removeFromGroup = async (req:Request, res:Response):Promise<void> => {};

export const changeRoles = async (req:Request, res:Response):Promise<void> => {};
