import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    householdId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Household",
        required: true
    },
    type:[{
    expiry: {
        type: Date,
        required: false
    },
    lowStock: {
        type: Boolean,
        default: false
    },
    }],
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});