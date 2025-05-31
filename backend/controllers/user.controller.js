import mongoose from "mongoose";
import User from "../models/User.js";

export const getUser = async (req, res) => {
  const id = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  const userinfo = await User.findById(id);

  if (!userinfo) {
    return res.status(404).json({ message: "User not found" });
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

export const inviteToHousehold = async (req, res) => {};
export const getGroupUsersList = async (req, res) => {
  const userId = req.user.id;
  const user = await User.find({ _id: userId });
  res.status(200).json({ user: user.households });
};

export const removeFromGroup = async (req, res) => {};

export const changeRoles = async (req, res) => {};
