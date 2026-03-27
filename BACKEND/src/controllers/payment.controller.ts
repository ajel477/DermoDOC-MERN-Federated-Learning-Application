// routes/payment.routes.js
import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Payment } from "../models/payment.model";
import mongoose from "mongoose";

const router = Router();

/* MAKE PAYMENT */
router.post(
  "/pay",
  asyncHandler(async (req: Request, res: Response) => {
    const payment = await Payment.create(req.body);

    res.json({
      msg: "Payment successful",
      payment,
    });
  })
);

/* VIEW PAYMENTS BY DOCTOR ID */
router.get(
  "/doctor/:doctorId",
  asyncHandler(async (req: Request, res: Response) => {
    const payments = await Payment.find({
      doctorId: req.params.doctorId,
    }).populate("patientId", "name email mobileNumber")
      .populate("doctorId", "name specialization hospitalName")
      .sort({ createdAt: -1 });

    res.json(payments);
  })
);

/* VIEW PAYMENTS BY PATIENT ID */
router.get(
  "/patient/:patientId",
  asyncHandler(async (req: Request, res: Response) => {
    const payments = await Payment.find({
      patientId: req.params.patientId,
    }).populate("patientId", "name email mobileNumber")
      .populate("doctorId", "name specialization hospitalName")
      .sort({ createdAt: -1 });

    res.json(payments);
  })
);

/* VIEW PAYMENT BY APPOINTMENT ID */
router.get(
  "/appointment/:appointmentId",
  asyncHandler(async (req: Request, res: Response) => {
    const payment = await Payment.findOne({
      appointmentId: req.params.appointmentId,
    }).populate("patientId", "name email mobileNumber")
      .populate("doctorId", "name specialization hospitalName");

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found for this appointment" });
    }

    res.json(payment);
  })
);

/* VIEW SINGLE PAYMENT BY ID */
router.get(
  "/details/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const payment = await Payment.findById(req.params.id)
      .populate("patientId", "name email mobileNumber age gender image")
      .populate("doctorId", "name specialization hospitalName mobileNumber email image address");

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    res.json(payment);
  })
);

/* GET PAYMENT STATS FOR DOCTOR */
router.get(
  "/stats/doctor/:doctorId",
  asyncHandler(async (req: Request, res: Response) => {
    const doctorId = req.params.doctorId;
    
    const totalPayments = await Payment.countDocuments({ doctorId });
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    const thisMonthPayments = await Payment.aggregate([
      { $match: { doctorId: new mongoose.Types.ObjectId(doctorId), createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const thisYearPayments = await Payment.aggregate([
      { $match: { doctorId: new mongoose.Types.ObjectId(doctorId), createdAt: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const totalRevenue = await Payment.aggregate([
      { $match: { doctorId: new mongoose.Types.ObjectId(doctorId), paymentStatus: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      totalTransactions: totalPayments,
      thisMonthRevenue: thisMonthPayments[0]?.total || 0,
      thisYearRevenue: thisYearPayments[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  })
);

/* GET PAYMENT STATS FOR PATIENT */
router.get(
  "/stats/patient/:patientId",
  asyncHandler(async (req: Request, res: Response) => {
    const patientId = req.params.patientId;
    
    const totalPayments = await Payment.countDocuments({ patientId });
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const thisMonthPayments = await Payment.aggregate([
      { $match: { patientId: new mongoose.Types.ObjectId(patientId), createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const totalSpent = await Payment.aggregate([
      { $match: { patientId: new mongoose.Types.ObjectId(patientId), paymentStatus: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      totalTransactions: totalPayments,
      thisMonthSpent: thisMonthPayments[0]?.total || 0,
      totalSpent: totalSpent[0]?.total || 0,
    });
  })
);

/* UPDATE PAYMENT STATUS */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    res.json({
      msg: "Payment updated successfully",
      payment,
    });
  })
);

export default router;