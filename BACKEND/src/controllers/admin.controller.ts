import { Request, Response, Router } from "express";
import asyncHandler from "../middlewares/AsyncHandler";
import { Doctor } from "../models/doctor.model";
import { BadRequest, Unauthorized } from "../customErrors";
import { RoleEnum } from "../types";
import { sendMail } from "../constants/lib";
import CONFIG from "../config";

const router = Router();

/**
 * @description Middleware to ensure the user is an Admin
 */
const isAdmin = (req: Request, _res: Response, next: any) => {
  if (req.user.role !== RoleEnum.ADMIN) {
    throw new Unauthorized("Access restricted to administrators only");
  }
  next();
};

// Apply isAdmin middleware to all routes in this controller
router.use(isAdmin);

/**
 * @description Get all pending doctor registrations
 * @route GET /api/admin/pending-doctors
 */
router.get(
  "/pending-doctors",
  asyncHandler(async (_req: Request, res: Response) => {
    const doctors = await Doctor.find({ isAccepted: false }).select("-password");
    res.json({
      success: true,
      doctors,
    });
  })
);

/**
 * @description Verify (Approve) a doctor registration
 * @route PATCH /api/admin/verify-doctor/:id
 */
router.patch(
  "/verify-doctor/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      throw new BadRequest("Doctor not found");
    }

    if (doctor.isAccepted) {
      throw new BadRequest("Doctor is already verified");
    }

    // Update doctor status
    doctor.isAccepted = true;
    doctor.accountStatus = "Active";
    await doctor.save();

    // Send the "Approved" email
    sendMail(doctor.email, "Registration Approved - DermoDoc", "registration-approved.html", {
      name: doctor.name,
      clientUrl: CONFIG.CLIENT_URL,
    });

    res.json({
      success: true,
      msg: "Doctor verified successfully",
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        isAccepted: doctor.isAccepted,
      },
    });
  })
);

/**
 * @description Reject/Delete a doctor registration (Optional)
 * @route DELETE /api/admin/reject-doctor/:id
 */
router.delete(
  "/reject-doctor/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) {
      throw new BadRequest("Doctor not found");
    }

    res.json({
      success: true,
      msg: "Doctor registration rejected and removed",
    });
  })
);

export default router;
