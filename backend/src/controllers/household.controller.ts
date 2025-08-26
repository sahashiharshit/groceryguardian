
import type { Request, Response } from "express";
import Household, { ROLES } from "../models/Household.js";
import { Types } from "mongoose";
import User from "../models/User.js";
import Invitation from "../models/Invitation.js";
import GroceryListItem from "../models/GroceryListItem.js";
import type { ObjectId } from "../types/mongo.js";
import { withTransaction } from "../utils/transactions.js";
import PantryItem from "../models/PantryItem.js";

//Create a new household
export const createHousehold = async (req: Request, res: Response): Promise<void> => {

    const { name } = req.body;
    const userId = req.user?.id;

    if (!name) {
        res.status(400);
        throw new Error("Household name is required");
    }

    // Check if user is already part of a household
    const existing = await Household.findOne({ "members.userId": userId });
    if (existing) {
        res.status(403);
        throw new Error("User already belongs to a household");
    }
    const household = await withTransaction(async (session) => {

        // Create a new household
        const created = await Household.create([{
            name,
            members: [{ userId, role: "owner" }]
        }], { session });
        // Update User to set householdId
        await User.findByIdAndUpdate(userId, { householdId: created[0]?._id }, { session });
        // Update GroceryListItem to set householdId
        await GroceryListItem.updateMany(
            { addedBy:userId, householdId: null },
            { $set: { householdId: created[0]?._id } },
            { session }
        );
        // Update PantryItem to set householdId
        await PantryItem.updateMany(
            { addedBy: userId, householdId: null },
            { $set: { householdId: created[0]?._id } },
            { session }
        );
        return created[0];
    });
    res.status(201).json(household);
    return;
};

// Get Household info By Id
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
// Update Household Member
// This function updates the role of a household member or adds a new member if they are not already part of the household.
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

    const household = await withTransaction(async (session) => {
        const householdDoc = await Household.findById(id).session(session);
        if (!householdDoc) {
            throw new Error('Household not found');
        }
        const memberIndex = householdDoc.members.findIndex((m) => m.userId.toString() === userId);
        if (memberIndex !== -1) {
            householdDoc.members[memberIndex]!.role = role || householdDoc.members[memberIndex]!.role;
        } else {
            householdDoc.members.push({ userId: new Types.ObjectId(userId), role: role || 'member' });
        }

        await householdDoc.save({ session });
        return householdDoc;
    });

    res.status(200).json({ message: 'Member updated successfully', household });
    return;
};

// Remove Household Member
// This function removes a member from the household by their userId.
export const removeHouseholdMember = async (req: Request, res: Response): Promise<void> => {

    const { id, userId } = req.params;

    if (!id || !userId || !Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error('Invalid ID format');
    }
    const household = await withTransaction(async (session) => {
        const householdDoc = await Household.findById(id).session(session);

        if (!householdDoc) {
            throw new Error('Household not found');
        }

        householdDoc.members = householdDoc.members.filter((m) => m.userId.toString() !== userId);

        await householdDoc.save({ session });
        await User.findByIdAndUpdate(userId, { householdId: null }, { session });
        await GroceryListItem.updateMany(
            { addedBy:userId, householdId: householdDoc._id },
            { $set: { householdId: null } },
            { session }
        );
        await Invitation.deleteMany({ recipient: userId, household: householdDoc._id }).session(session);

        return householdDoc;
    });
    res.status(200).json({ message: 'Member removed successfully', household });
    return;
};
// Search User to Invite
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

// Invite User to Household
export const inviteUserToHousehold = async (req: Request, res: Response): Promise<void> => {
    const householdId = req.params.id;
    const senderId = req.user?.id;
    const { recipientId } = req.body;


    const invite = await withTransaction(async (session) => {
        const household = await Household.findById(householdId).session(session);
        if (!household) {
            throw new Error("Household not found");
        }
        const senderMember = household.members.find(m => m.userId.toString() === senderId);
        if (!senderMember || senderMember.role !== "owner") {
            throw new Error("Only the group owner can invite");
        }

        const existingInvitation = await Invitation.findOne({ recipient: recipientId, household: householdId }).session(session);
        if (existingInvitation && existingInvitation.status === "pending") {
            throw new Error("User already has a pending invitation");
        }
        if (existingInvitation && ["rejected"].includes(existingInvitation.status)) {
            await existingInvitation.deleteOne({ session });
        }
        const [createdInvite] = await Invitation.create([{
            sender: senderId,
            recipient: recipientId,
            household: householdId
        }], { session });

        return createdInvite;
    });
    res.status(200).json({ success: true, message: "Invitation sent", invite });
    return;
};
// Response to the invitation
export const respondToInvitation = async (req: Request, res: Response): Promise<void> => {
    const { invitationId } = req.params;
    const { action } = req.body;
    const userId = req.user?.id;

    await withTransaction(async (session) => {

        const invitation = await Invitation.findById(invitationId).session(session);
        if (!invitation || invitation.recipient.toString() !== userId) {

            res.status(403);
            throw new Error("Invalid invitation");
        }

        if (invitation.status !== "pending") {

            res.status(400);
            throw new Error("Invitation already responded to");
        }

        if (action === "accept") {
            const household = await Household.findById(invitation.household).session(session);
            if (!household) {
                res.status(404);
                throw new Error("Household not found");
            }

            household.members.push({ userId: new Types.ObjectId(userId), role: "member" });
            await household.save({ session });

            await User.findByIdAndUpdate(userId, { householdId: household._id }, { session });
            await GroceryListItem.updateMany(
                { addedBy: userId },
                { $set: { householdId: household._id } },
                { session }
            );
            await PantryItem.updateMany(
                { addedBy: userId },
                { $set: { householdId: household._id } },
                { session }
            );
            invitation.status = "accepted";
            await invitation.save({ session });

            res.json({ message: "You have joined the group" });
            return;
        } else if (action === "reject") {
            invitation.status = "rejected";
            await invitation.save({ session });

            res.json({ message: "You have rejected the invitation" });
            return;
        }
    });
    res.status(400);
    throw new Error("Invalid action");

};
// Get List of my Invitations
// This function retrieves all pending invitations for the user.
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

    await withTransaction(async (session) => {

        const user = await User.findById(userId).populate('householdId').session(session);
        if (!user) {

            res.status(400);
            throw new Error("User not found");

        }
        if (!user.householdId) {

            res.status(400);
            throw new Error("You are not in a household");

        }
        const household = user.householdId as typeof Household.prototype;
        const membership = household.members.find((m: any) => m.userId.toString() === (user._id as ObjectId).toString());
        if (!membership) {
            res.status(400);
            throw new Error("You are not a member of this household");
        }
        if (membership.role === "owner") {
            const ownerCount = household.members.filter((m: any) => m.role === "owner").length;
            if (ownerCount === 1) {

                res.status(403);
                throw new Error("You are the last owner. Please delete the household or transfer ownership first.");
            }
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
    });
        res.status(200).json({ success: true, message: "You have left the household" });
        return;
    };

    export const deleteHousehold = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!id || !Types.ObjectId.isValid(id)) {
            res.status(400);
            throw new Error('Invalid Household ID format');
        }

        await withTransaction(async (session) => {

        const household = await Household.findById(id).session(session);
        if (!household) {
          
            res.status(404);
            throw new Error("Household not found");
        }
        const member = household.members.find(m => m.userId.toString() === userId);
        if (!member || member.role !== "owner") {
           
            res.status(403);
            throw new Error("Only the group owner can delete the household");
        }

        await User.updateMany(
            { householdId: household._id },
            { $set: { householdId: null } },
            { session }
        );

        await GroceryListItem.updateMany(
            { householdId: household._id },
            { $set: { householdId: null } },
            { session }
        );
        await PantryItem.updateMany(
            { householdId: household._id },
            { $set: { householdId: null } },
            { session }
        );

        await Invitation.deleteMany({ household: household._id }, { session });


        await household.deleteOne({ session });
        });
        res.status(200).json({ success: true, message: "Household deleted" });
        return;
    };