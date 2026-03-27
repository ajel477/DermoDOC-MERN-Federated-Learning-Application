// models/consultation.model.ts
import { Schema, model, Types } from "mongoose";

export interface IConsultation {
    doctorId: Types.ObjectId;
    patientId: Types.ObjectId;
    appointmentId: Types.ObjectId;
    message: string;
    consultationType: string;
    read: boolean; // Add this field
    createdAt: Date;
    updatedAt: Date;
}

const consultationSchema = new Schema(
    {
        doctorId: { type: Schema.Types.ObjectId, ref: "doctors", required: true },
        patientId: { type: Schema.Types.ObjectId, ref: "patients", required: true },
        appointmentId: { type: Schema.Types.ObjectId, ref: "appointments", required: true },
        message: { type: String },
        messagedBy: {
            type: String,
            enum: ["doctor", "patient"],
            required: true
        },

        consultationType: {
            type: String,
            enum: ["Chat", "Video"],
            default: "Chat"
        },

        read: { type: Boolean, default: false }
    },
    { timestamps: true, collection: "consultations" }
);

export const Consultation = model<IConsultation>("consultations", consultationSchema);