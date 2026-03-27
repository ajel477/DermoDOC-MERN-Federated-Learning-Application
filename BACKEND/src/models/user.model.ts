import { Schema, model } from "mongoose";
import { IBaseUser, IbaseUserSchema } from "./base.model";

export interface IPatient extends IBaseUser {
  mobileNumber: string;
  age: number;
  gender: string;
  address: string;
  image: string;
  accountStatus: string;
  accountCreatedAt: Date;
}

const patientSchema = new Schema(
  {
    ...IbaseUserSchema,
    mobileNumber: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    address: { type: String, required: true },
    image: { type: String },
    accountStatus: { type: String, enum: ["Active", "Blocked"], default: "Active" },
    accountCreatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: "patients" }
);

export const Patient = model<IPatient>("patients", patientSchema);