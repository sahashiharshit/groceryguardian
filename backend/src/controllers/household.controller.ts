
import type { Request, Response } from "express";
import Household, { ROLES } from "../models/Household.js";
import {Types } from "mongoose";
import User from "../models/User.js";
import Invitation from "../models/Invitation.js";
import GroceryListItem from "../models/GroceryListItem.js";
import type { ObjectId } from "../types/mongo.js";


export const createHousehold = async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;
    const userId = req.user?.id;

    if (!name) {
        res.status(400).json({ error: "Household name is required" });
        return;
    }

    // Check if user is already part of a household
    const existing = await Household.findOne({ "members.userId": userId });
    if (existing) {
        res.status(403);
        throw new Error("User already belongs to a household");
    }

    const session = await Household.startSession();
    session.startTransaction();

    const household = await Household.create([{
        name,
        members: [{ userId, role: "owner" }]
    }], { session });

    await User.findByIdAndUpdate(userId, { householdId: household[0]?._id }, { session });

    await GroceryListItem.updateMany(
        { userId, householdId: null },
        { $set: { householdId: household[0]?._id } },
        { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(household[0]);
    return;
};


export const getHouseholdById = async (req: Request, res: Response): Promise<void> => {

    const userId = req.user?.id;

    if (!userId || !Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error('Invalid User Id');
    }
    const household = await Household.findOne({ "members.userId": userId }).populate('members.userId', 'name email');
    if (!household) {
        res.status(404);
        throw new Error('Household not found');
    
    }
    res.status(200).json(household);
    return;
};

export const updateHouseholdMember = async (req: Request, res: Response): Promise<void> => {

    const { id, userId } = req.params;
    const { role } = req.body;

    if (!id || !userId || !Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error('Invalid ID format');
    }

    if (role && !ROLES.includes(role)) {
        throw new Error('Invalid role');
    }

    const session = await Household.startSession();
    session.startTransaction();

    const household = await Household.findById(id).session(session);

    if (!household) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Household not found');
    }

    const memberIndex = household.members.findIndex((m) => m.userId.toString() === userId);

    if (memberIndex !== -1) {
        household.members[memberIndex]!.role = role || household.members[memberIndex]!.role;
    } else {
        household.members.push({ userId: new Types.ObjectId(userId), role: role || 'member' });
    }

    await household.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: 'Member updated', household });
    return;
};

export const removeHouseholdMember = async (req: Request, res: Response): Promise<void> => {

    const { id, userId } = req.params;

    if (!id || !userId || !Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
        res.status(400);
         throw new Error('Invalid ID format');
    }

    const household = await Household.findById(id);

    if (!household) {
        throw new Error('Household not found');
    }

    household.members = household.members.filter((m) => m.userId.toString() !== userId);

    await household.save();
    res.status(200).json({ message: 'Member removed', household });
    return;
};

export const searchUserToInvite = async (req: Request, res: Response) => {

    const { identifier } = req.query;

    if (!identifier || typeof identifier !== "string") {
        res.status(400);
        throw new Error("Query is required");
    }

    const user = await User.findOne({

        householdId: null,
        $or: [{
            email: identifier
        }, {
            mobileNo: identifier
        }]
    }).select("-password");
    if (!user) {
        res.status(404);
        throw new Error("No eligible user found or already in a group");
    }
    res.status(200).json(user);
    return;
};

export const inviteUserToHousehold = async (req: Request, res: Response): Promise<void> => {
    const householdId = req.params.id;
    const senderId = req.user?.id;
    const { recipientId } = req.body;

    const session = await Household.startSession();
    session.startTransaction();

    const household = await Household.findById(householdId).session(session);
    if (!household) {
        await session.abortTransaction();
        session.endSession();
        res.status(404);
        throw new Error("Household not found");
    }
    const senderMember = household.members.find(m => m.userId.toString() === senderId);
    if (!senderMember || senderMember.role !== "owner") {
        await session.abortTransaction();
        session.endSession();
        throw new Error("Only the group owner can invite");
    }

    const existingInvitation = await Invitation.findOne({ recipient: recipientId, household: householdId }).session(session);
    if (existingInvitation && existingInvitation.status === "pending") {
        await session.abortTransaction();
        session.endSession();
        throw new Error("User already has a pending invitation");
    }
    if (existingInvitation && ["rejected"].includes(existingInvitation.status)) {
        await existingInvitation.deleteOne({ session });
    }
    const invite = await Invitation.create([{
        sender: senderId,
        recipient: recipientId,
        household: householdId
    }], { session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, message: "Invitation sent", invite: invite[0] });
    return;
};

export const respondToInvitation = async (req: Request, res: Response): Promise<void> => {
    const { invitationId } = req.params;
    const { action } = req.body;
    const userId = req.user?.id;

    const session = await Invitation.startSession();
    session.startTransaction();

    const invitation = await Invitation.findById(invitationId).session(session);
    if (!invitation || invitation.recipient.toString() !== userId) {
        await session.abortTransaction();
        session.endSession();
        res.status(403);
        throw new Error("Invalid invitation");
    }

    if (invitation.status !== "pending") {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error("Invitation already responded to");
    }

    if (action === "accept") {
        const household = await Household.findById(invitation.household).session(session);
        if (!household) {
            await session.abortTransaction();
            session.endSession();
            res.status(404);
            throw new Error("Household not found");
        }

        household.members.push({ userId: new Types.ObjectId(userId), role: "member" });
        await household.save({ session });

        await User.findByIdAndUpdate(userId, { householdId: household._id }, { session });

        invitation.status = "accepted";
        await invitation.save({ session });

        await session.commitTransaction();
        session.endSession();
        res.json({ message: "You have joined the group" });
        return;
    } else if (action === "reject") {
        invitation.status = "rejected";
        await invitation.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.json({ message: "You have rejected the invitation" });
        return;
    }

    await session.abortTransaction();
    session.endSession();
    res.status(400);
    throw new Error("Invalid action");
    
};

export const getMyInvitations = async (req: Request, res: Response): Promise<void> => {

    const userId = req.user?.id;

    if (!userId) {
        res.status(401);
        throw new Error("Unauthorized");
    }


    const invitations = await Invitation.find({ recipient: userId, status: "pending" })
        .populate("household", "name")
        .populate("sender", "name email");

    res.status(200).json(invitations);
    return;
};

export const leaveHousehold = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    const session = await Household.startSession();
    session.startTransaction();

    const user = await User.findById(userId).populate('householdId').session(session);
    if (!user) {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error("User not found");
        
    }
    if (!user.householdId) {
        await session.abortTransaction();
        session.endSession();
        res.status(400); 
        throw new Error("You are not in a household");
        
    }
    const household = user.householdId as typeof Household.prototype;
    const membership = household.members.find((m: any) => m.userId.toString() === (user._id as ObjectId).toString());
    if (!membership) {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error("You are not a member of this household");
    }
    if (membership.role === "owner") {
        await session.abortTransaction();
        session.endSession();
        res.status(403);
        throw new Error("Group owner cannot leave the household. Please delete the household or transfer ownership first.");
    }
    household.members = household.members.filter((m: any) => m.userId.toString() !== (user._id as ObjectId).toString());
    await household.save({ session });
    user.householdId = null;
    await user.save({ session });
    await GroceryListItem.updateMany(
        { userId, householdId: household._id },
        { $set: { householdId: null } },
        { session }
    );
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, message: "You have left the household" });
    return;
};
