// models/skinPrediction.model.ts
import { Schema, model, Types } from "mongoose";

export interface ISkinPrediction {
    patientId: Types.ObjectId;
    image: string;
    predictedDisease: string;
    confidence: number;
    createdAt: Date;
    updatedAt: Date;
}

const predictionSchema = new Schema(
    {
        patientId: { type: Schema.Types.ObjectId, ref: "patients", required: true },
        image: { type: String, required: true },
        predictedDisease: { type: String, required: true },
        confidence: { type: Number }
    },
    { timestamps: true }
);

export const SkinPrediction = model<ISkinPrediction>("skinPrediction", predictionSchema);