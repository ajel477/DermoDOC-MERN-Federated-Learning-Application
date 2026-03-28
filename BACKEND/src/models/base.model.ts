import { Document } from "mongoose";

export interface IBaseUser extends Document {
  name: string;
  email: string;
  password: string;
  lastLogin?: Date;
  isAccepted?: boolean;
}

export const IbaseUserSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lastLogin: { type: Date, default: Date.now },
  isAccepted: { type: Boolean, default: true },
};
