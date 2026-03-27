import { Schema, model } from "mongoose";
import { IBaseUser, IbaseUserSchema } from "./base.model";

export interface IDoctor extends IBaseUser {
    mobileNumber: string;
    specialization: string;
    experience: number;
    hospitalName: string;
    address: string;
    image: string;
    consultationFee: number;
    accountStatus: string;
    lastLogin: Date;
    accountCreatedAt: Date;
}

const doctorSchema = new Schema(
    {
        ...IbaseUserSchema,
        mobileNumber: { type: String, required: true },
        specialization: { type: String, required: true },
        experience: { type: Number, required: true },
        hospitalName: { type: String, required: true },
        address: { type: String, required: true },
        image: { type: String },
        consultationFee: { type: Number, required: true },
        isAccepted: { type: Boolean, default: true },
        accountStatus: { type: String, enum: ["Active", "Pending", "Blocked"], default: "Active" },
        lastLogin: { type: Date, default: Date.now },
        accountCreatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true, collection: "doctors" }
);

export const Doctor = model<IDoctor>("doctors", doctorSchema);