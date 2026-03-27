import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Patient } from "../models/user.model";
import { BadRequest } from "../customErrors";

const router = Router();

/* GET ALL PATIENTS */
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const patients = await Patient.find({});
    res.json(patients);
  })
);

/* GET SINGLE PATIENT */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const patient = await Patient.findById(req.params.id);

    if (!patient) throw new BadRequest("Patient not found");

    res.json(patient);
  })
);

export default router;