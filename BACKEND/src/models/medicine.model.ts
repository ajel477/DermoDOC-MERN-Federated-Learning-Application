// models/medicine.model.ts
import { Schema, model, Types } from "mongoose";

export interface IMedicine {
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  appointmentId: Types.ObjectId;
  medicines: string;
  notes: string;
  diagnosis?: string;
  labTests?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const medicineSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "doctors", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "patients", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "appointments", required: true },
    medicines: { type: String, required: true },
    notes: { type: String },
    diagnosis: { type: String },
    labTests: { type: String },
    followUpDate: { type: Date }
  },
  { timestamps: true }
);

export const Medicine = model<IMedicine>("medicine", medicineSchema);