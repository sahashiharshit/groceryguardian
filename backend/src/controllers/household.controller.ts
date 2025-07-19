
import type { Request, Response } from "express";
import Household, { ROLES } from "../models/Household";
import { Schema, Types } from "mongoose";
import User from "../models/User";
import Invitation from "../models/Invitation";
import GroceryListItem from "../models/GroceryListItem";


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
        res.status(403).json({ error: "User already belongs to a household" });
        return;
    }
    const household = await Household.create({
        name,
        members: [{ userId, role: "owner" }]
    });
    await User.findByIdAndUpdate(userId, { household: household._id });

    await GroceryListItem.updateMany({
        userId, householdId: null
    }, { $set: { householdId: household._id } });
    res.status(201).json(household);


};


export const getHouseholdById = async (req: Request, res: Response): Promise<void> => {

    const userId = req.user?.id;

    if (!userId || !Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'Invalid User Id' });
        return
    }
    const household = await Household.findOne({ "members.userId": userId }).populate('members.userId', 'name email');
    if (!household) {
        res.status(404).json({ error: 'Household not found' });
        return
    }
    res.json(household);
};

export const updateHouseholdMember = async (req: Request, res: Response): Promise<void> => {

    const { id, userId } = req.params;
    const { role } = req.body;

    if (!id || !userId || !Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return
    }

    if (role && !ROLES.includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return
    }

    const household = await Household.findById(id);

    if (!household) {
        res.status(404).json({ error: 'Household not found' });
        return
    }

    const memberIndex = household.members.findIndex((m) => m.userId.toString() === userId);

    if (memberIndex !== -1) {
        household.members[memberIndex]!.role = role || household.members[memberIndex]!.role;
    } else {
        household.members.push({ userId: new Types.ObjectId(userId), role: role || 'member' });
    }

    await household.save();
    res.json({ message: 'Member updated', household });

};

export const removeHouseholdMember = async (req: Request, res: Response): Promise<void> => {

    const { id, userId } = req.params;

    if (!id || !userId || !Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return
    }

    const household = await Household.findById(id);

    if (!household) {
        res.status(404).json({ error: 'Household not found' });
        return;
    }

    household.members = household.members.filter((m) => m.userId.toString() !== userId);

    await household.save();
    res.json({ message: 'Member removed', household });

};

export const searchUserToInvite = async (req: Request, res: Response) => {

    const { identifier } = req.query;
    console.log(identifier);
    if (!identifier || typeof identifier !== "string") {
        res.status(400).json({ error: "Query is required" });
        return;
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
        res.status(404).json({ message: "No eligible user found or already in a group" });
        return;
    }
    console.log(user);
    res.json(user);
};

export const inviteUserToHousehold = async (req: Request, res: Response): Promise<void> => {

    const householdId = req.params.id;
    const senderId = req.user?.id;
    const { recipientId } = req.body;

    const household = await Household.findById(householdId);
    if (!household) {
        res.status(404).json({ error: "Household not found" });
        return;
    }
    const senderMember = household.members.find(m => m.userId.toString() === senderId);
    if (!senderMember || senderMember.role !== "owner") {
        res.status(403).json({ error: "Only the group owner can invite" });
        return
    }

    const existingInvitation = await Invitation.findOne({ recipient: recipientId, household: householdId, status: "pending" });
    if (existingInvitation) {
        res.status(400).json({ error: "User already has a pending invitation" });
        return;
    }

    const invite = await Invitation.create({
        sender: senderId,
        recipient: recipientId,
        household: householdId
    });

    res.status(201).json({ message: "Invitation sent", invite });
};

export const respondToInvitation = async (req: Request, res: Response): Promise<void> => {
    const { invitationId } = req.params;
    const { action } = req.body;
    const userId = req.user?.id;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation || invitation.recipient.toString() !== userId) {
        res.status(403).json({ error: "Invalid invitation" });
        return
    }

    if (invitation.status !== "pending") {
        res.status(400).json({ error: "Invitation already responded to" });
        return;
    }

    if (action === "accept") {
        // Add user to household
        const household = await Household.findById(invitation.household);
        if (!household) {
            res.status(404).json({ error: "Household not found" });
            return;
        }

        household.members.push({ userId: new Types.ObjectId(userId), role: "member" });
        await household.save();

        // Update user
        await User.findByIdAndUpdate(userId, { householdId: household._id });

        invitation.status = "accepted";
        await invitation.save();

        res.json({ message: "You have joined the group" });
        return;
    } else if (action === "reject") {
        invitation.status = "rejected";
        await invitation.save();
        res.json({ message: "You have rejected the invitation" });
        return
    }

    res.status(400).json({ error: "Invalid action" });
};

export const getMyInvitations = async (req: Request, res: Response): Promise<void> => {

    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }


    const invitations = await Invitation.find({ recipient: userId, status: "pending" })
        .populate("household", "name")
        .populate("sender", "name email");

    res.json(invitations);

};