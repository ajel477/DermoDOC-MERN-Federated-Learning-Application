import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Consultation } from "../models/consultation.model";
import { BadRequest } from "../customErrors";
import { uploadLocal } from "../constants/lib";

const router = Router();

/* SEND MESSAGE */
router.post(
  "/message",
  asyncHandler(async (req: Request, res: Response) => {
    const { appointmentId, doctorId, patientId, message, messagedBy, consultationType } = req.body;

    // Validate required fields
    if (!appointmentId || !doctorId || !patientId) {
      throw new BadRequest("Missing required fields: appointmentId, doctorId, or patientId");
    }

    if (!messagedBy || !['doctor', 'patient'].includes(messagedBy)) {
      throw new BadRequest("Invalid messagedBy value. Must be 'doctor' or 'patient'");
    }

    const messageData = {
      appointmentId,
      doctorId,
      patientId,
      message: message || "",
      messagedBy,
      consultationType: consultationType || "Chat",
      read: false
    };

    const consultation = await Consultation.create(messageData);

    res.json({
      msg: "Message sent",
      message: consultation,
    });
  })
);

/* UPLOAD FILE */
router.post(
  "/upload",
  uploadLocal.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    const { appointmentId, doctorId, patientId, messagedBy, consultationType } = req.body;

    if (!req.file) {
      throw new BadRequest("No file uploaded");
    }

    if (!appointmentId || !doctorId || !patientId) {
      throw new BadRequest("Missing required fields: appointmentId, doctorId, or patientId");
    }

    const messager = messagedBy && ['doctor', 'patient'].includes(messagedBy) ? messagedBy : 'patient';

    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/static/uploads/${req.file.filename}`;

    const messageData = {
      appointmentId,
      doctorId,
      patientId,
      message: fileUrl,
      messagedBy: messager,
      consultationType: consultationType || "Chat",
      read: false
    };

    const consultation = await Consultation.create(messageData);

    res.json({
      msg: "File uploaded successfully",
      message: consultation,
    });
  })
);

/* GET CONSULTATION */
router.get(
  "/:appointmentId",
  asyncHandler(async (req: Request, res: Response) => {
    const chats = await Consultation.find({
      appointmentId: req.params.appointmentId,
    });

    res.json(chats);
  })
);

export default router;