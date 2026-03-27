// routes/prescription.routes.js
import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Medicine } from "../models/medicine.model";

const router = Router();

/* ADD PRESCRIPTION */
router.post(
  "/add",
  asyncHandler(async (req: Request, res: Response) => {
    const medicine = await Medicine.create(req.body);

    res.json({
      msg: "Prescription added",
      medicine,
    });
  })
);

/* GET ALL PRESCRIPTIONS BY DOCTOR ID */
router.get(
  "/doctor/:doctorId",
  asyncHandler(async (req: Request, res: Response) => {
    const prescriptions = await Medicine.find({
      doctorId: req.params.doctorId,
    })
      .populate("patientId", "name email mobileNumber age gender image")
      .populate("doctorId", "name specialization hospitalName mobileNumber email image address")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  })
);

/* GET ALL PRESCRIPTIONS BY PATIENT ID */
router.get(
  "/patient/:patientId",
  asyncHandler(async (req: Request, res: Response) => {
    const prescriptions = await Medicine.find({
      patientId: req.params.patientId,
    })
      .populate("patientId", "name email mobileNumber age gender image")
      .populate("doctorId", "name specialization hospitalName mobileNumber email image address")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  })
);

/* GET PRESCRIPTION BY APPOINTMENT ID */
router.get(
  "/appointment/:appointmentId",
  asyncHandler(async (req: Request, res: Response) => {
    const prescription = await Medicine.findOne({
      appointmentId: req.params.appointmentId,
    }).populate("patientId", "name email mobileNumber age gender image")
      .populate("doctorId", "name specialization hospitalName mobileNumber email image address");

    res.json(prescription);
  })
);

/* GET PRESCRIPTION BY ID */
router.get(
  "/details/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const prescription = await Medicine.findById(req.params.id)
      .populate("patientId", "name email mobileNumber age gender image address")
      .populate("doctorId", "name specialization hospitalName mobileNumber email image address");

    if (!prescription) {
      return res.status(404).json({ msg: "Prescription not found" });
    }

    res.json(prescription);
  })
);

/* UPDATE PRESCRIPTION */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const prescription = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("patientId", "name email mobileNumber age gender image")
      .populate("doctorId", "name specialization hospitalName mobileNumber email image address");

    if (!prescription) {
      return res.status(404).json({ msg: "Prescription not found" });
    }

    res.json({
      msg: "Prescription updated successfully",
      prescription,
    });
  })
);

/* DELETE PRESCRIPTION */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const prescription = await Medicine.findByIdAndDelete(req.params.id);

    if (!prescription) {
      return res.status(404).json({ msg: "Prescription not found" });
    }

    res.json({
      msg: "Prescription deleted successfully",
    });
  })
);

/* GET PRESCRIPTIONS BY DATE RANGE */
router.get(
  "/doctor/:doctorId/date-range",
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    
    const prescriptions = await Medicine.find({
      doctorId: req.params.doctorId,
      createdAt: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    })
      .populate("patientId", "name email mobileNumber age gender image")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  })
);

/* GET PRESCRIPTIONS STATS FOR DOCTOR */
router.get(
  "/stats/doctor/:doctorId",
  asyncHandler(async (req: Request, res: Response) => {
    const doctorId = req.params.doctorId;
    
    const totalPrescriptions = await Medicine.countDocuments({ doctorId });
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    const thisMonthPrescriptions = await Medicine.countDocuments({
      doctorId,
      createdAt: { $gte: startOfMonth },
    });
    
    const thisYearPrescriptions = await Medicine.countDocuments({
      doctorId,
      createdAt: { $gte: startOfYear },
    });
    
    const uniquePatients = await Medicine.distinct("patientId", { doctorId });
    
    const withFollowUp = await Medicine.countDocuments({
      doctorId,
      followUpDate: { $ne: null },
    });

    res.json({
      total: totalPrescriptions,
      thisMonth: thisMonthPrescriptions,
      thisYear: thisYearPrescriptions,
      uniquePatients: uniquePatients.length,
      withFollowUp,
    });
  })
);

/* GET PRESCRIPTIONS STATS FOR PATIENT */
router.get(
  "/stats/patient/:patientId",
  asyncHandler(async (req: Request, res: Response) => {
    const patientId = req.params.patientId;
    
    const totalPrescriptions = await Medicine.countDocuments({ patientId });
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    const thisMonthPrescriptions = await Medicine.countDocuments({
      patientId,
      createdAt: { $gte: startOfMonth },
    });
    
    const uniqueDoctors = await Medicine.distinct("doctorId", { patientId });
    
    const withFollowUp = await Medicine.countDocuments({
      patientId,
      followUpDate: { $ne: null },
    });

    res.json({
      total: totalPrescriptions,
      thisMonth: thisMonthPrescriptions,
      uniqueDoctors: uniqueDoctors.length,
      withFollowUp,
    });
  })
);

/* DOWNLOAD PRESCRIPTION (for generating PDF later) */
router.get(
  "/download/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const prescription = await Medicine.findById(req.params.id)
      .populate("patientId")
      .populate("doctorId");

    if (!prescription) {
      return res.status(404).json({ msg: "Prescription not found" });
    }

    // You can implement PDF generation here
    // For now, return the prescription data
    res.json({
      msg: "Download endpoint - PDF generation to be implemented",
      prescription,
    });
  })
);

export default router;