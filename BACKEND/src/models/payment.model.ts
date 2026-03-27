import { Schema, model, Types } from "mongoose";

export interface IPayment {
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    appointmentId: Types.ObjectId;
    amount: number;
    paymentStatus: string;
    paymentDate: Date;
}

const paymentSchema = new Schema(
    {
        patientId: { type: Schema.Types.ObjectId, ref: "patients", required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: "doctors", required: true },
        appointmentId: { type: Schema.Types.ObjectId, ref: "appointments", required: true },
        amount: { type: Number, required: true },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Completed", "Failed"],
            default: "Pending"
        },
        paymentDate: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

export const Payment = model<IPayment>("payments", paymentSchema);