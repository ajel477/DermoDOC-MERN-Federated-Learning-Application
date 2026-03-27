import { Schema, model, Types } from "mongoose";

export interface IAppointment {
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    requestStatus: string;
    appointmentDate: Date;
    symptoms: string;
    createdAt: Date;
    updatedAt: Date;
}

const appointmentSchema = new Schema(
    {
        patientId: { type: Schema.Types.ObjectId, ref: "patients", required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: "doctors", required: true },
        requestStatus: {
            type: String,
            enum: ["Pending", "Accepted", "Rejected", "Completed" , "Cancelled"],
            default: "Pending"
        },
        appointmentDate: { type: Date },
        symptoms: { type: String }
    },
    { timestamps: true, collection: "appointments" }
);

export const Appointment = model<IAppointment>("appointments", appointmentSchema);