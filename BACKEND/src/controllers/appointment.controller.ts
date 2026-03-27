import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Appointment } from "../models/appointment.model";
import { BadRequest } from "../customErrors";

const router = Router();

/* BOOK DOCTOR */
router.post(
  "/book",
  asyncHandler(async (req: Request, res: Response) => {
    const appointment = await Appointment.create(req.body);

    res.json({
      msg: "Appointment request sent",
      appointment,
    });
  })
);

/* VIEW REQUESTS (DOCTOR) */
router.get(
  "/doctor/:doctorId",
  asyncHandler(async (req: Request, res: Response) => {
    const requests = await Appointment.find({
      doctorId: req.params.doctorId,
    })
    .populate("patientId")
    .populate("doctorId");

    // Fallback: if populate failed (patientId is null), keep the raw ObjectId
    const requestsWithFallback = requests.map((req: any) => {
      const reqObj = req.toObject();
      // If patientId is null after populate, check if we have the raw ID
      if (!reqObj.patientId && req.patientId) {
        reqObj.patientId = req.patientId.toString ? req.patientId.toString() : req.patientId;
      }
      return reqObj;
    });

    res.json(requestsWithFallback);
  })
);

router.get(
  "/patient/:patientId",
  asyncHandler(async (req: Request, res: Response) => {
    const requests = await Appointment.find({
      patientId: req.params.patientId,
    }).populate("doctorId");

    res.json(requests);
  })
);

/* ACCEPT / REJECT */
router.patch(
  "/status/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { requestStatus } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { requestStatus },
      { new: true }
    );

    if (!appointment) throw new BadRequest("Request not found");

    res.json({
      msg: "Request updated",
      appointment,
    });
  })
);

router.patch(
  "/cancel/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { requestStatus: "Cancelled" }, 
    );

    if (!appointment) throw new BadRequest("Appointment not found");

    res.json({
      msg: "Appointment cancelled successfully",
      appointment,
    });
  })
);

/* GET SINGLE APPOINTMENT - Must be after specific routes */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const appointment: any = await Appointment.findById(req.params.id)
      .populate("patientId")
      .populate("doctorId");

    if (!appointment) throw new BadRequest("Appointment not found");

    // Fallback: if populate failed (patientId is null), keep the raw ObjectId
    const appointmentObj = appointment.toObject();
    if (!appointmentObj.patientId && appointment.patientId) {
      (appointmentObj as any).patientId = appointment.patientId.toString ? appointment.patientId.toString() : appointment.patientId;
    }

    res.json(appointmentObj);
  })
);

export default router;