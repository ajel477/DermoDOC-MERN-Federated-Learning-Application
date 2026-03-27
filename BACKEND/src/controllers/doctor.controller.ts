import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Doctor } from "../models/doctor.model";
import { BadRequest } from "../customErrors";

const router = Router();

/* GET ALL DOCTORS */
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const doctors = await Doctor.find({ isAccepted: true }).select("-password");
    res.json(doctors);
  })
);

/* GET SINGLE DOCTOR */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const doctor = await Doctor.findById(req.params.id).select("-password");

    if (!doctor) throw new BadRequest("Doctor not found");

    res.json(doctor);
  })
);

/* UPDATE DOCTOR */
router.patch(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!doctor) throw new BadRequest("Doctor update failed");

    res.json({
      msg: "Doctor updated successfully",
      doctor,
    });
  })
);

export default router;