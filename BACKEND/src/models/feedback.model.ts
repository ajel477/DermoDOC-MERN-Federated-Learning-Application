import { Schema, model, Types } from "mongoose";

export interface IFeedback {
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  rating: number;
  comment: string;
}

const feedbackSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "doctors", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "patients", required: true },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String }
  },
  { timestamps: true }
);

export const Feedback = model<IFeedback>("feedback", feedbackSchema);