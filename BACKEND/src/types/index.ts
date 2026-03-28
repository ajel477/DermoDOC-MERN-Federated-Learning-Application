import { Schema } from "mongoose";

export type Role = "ADMIN" | "PATIENT" | "DOCTOR";

export type TokenInfo = {
  _id: Schema.Types.ObjectId;
  email: string;
  name: string;
  role: Role;
};

export enum RoleEnum {
  ADMIN = "ADMIN",
  PATIENT = "PATIENT",
  DOCTOR = "DOCTOR"
}

export enum Status {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}




