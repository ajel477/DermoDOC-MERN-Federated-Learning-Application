import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { SkinPrediction } from "../models/skinPrediction.model";
import { uploadLocal } from "../constants/lib";
import CONFIG from "../config";

const router = Router();

router.post(
  "/predict",
  uploadLocal.single("image"), // This handles the image upload
  asyncHandler(async (req: Request, res: Response) => {
    // Parse predictionDetails from the request body
    const { predictionDetails } = req.body;
    const file = req.file;

    // Parse the predictionDetails (as it's a JSON string)
    let parsedPredictionDetails;
    try {
      parsedPredictionDetails = JSON.parse(predictionDetails); // Convert the JSON string to an object
    } catch (err) {
      return res.status(400).json({ msg: "Invalid prediction details format" });
    }

    // Now, parsedPredictionDetails will have the necessary data
    const { patientId, predictedDisease, confidence } = parsedPredictionDetails;

    // Save the prediction along with the image URL
    const prediction = await SkinPrediction.create({
      patientId,
      predictedDisease,
      confidence,
      image: file ? `${CONFIG.HOST}/static/uploads/${file.filename}` : "", // Save image URL if file is uploaded
    });

    res.json({
      msg: "Prediction saved",
      prediction,
    });
  })
);

/* GET PATIENT HISTORY */
router.get(
  "/history/:patientId",
  asyncHandler(async (req: Request, res: Response) => {
    const predictions = await SkinPrediction.find({
      patientId: req.params.patientId,
    });

    res.json(predictions);
  })
);

export default router;