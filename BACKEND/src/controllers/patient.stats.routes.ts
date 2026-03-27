// patient.stats.routes.ts
import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Appointment } from "../models/appointment.model";
import { Patient } from "../models/user.model";
import { Doctor } from "../models/doctor.model";
import { Payment } from "../models/payment.model";
import { Feedback } from "../models/feedback.model";
import { Consultation } from "../models/consultation.model";
import { Medicine } from "../models/medicine.model";
import { SkinPrediction } from "../models/skinPrediction.model";
import { BadRequest } from "../customErrors";
import mongoose from "mongoose";

const router = Router();

// ==================== PATIENT DASHBOARD STATS ====================

/* GET COMPLETE PATIENT DASHBOARD STATS */
router.get(
  "/dashboard/:patientId",
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      throw new BadRequest("Invalid patient ID");
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new BadRequest("Patient not found");
    }

    // Get all appointments
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name specialization image consultationFee hospitalName')
      .sort({ createdAt: -1 });

    // Appointment statistics
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(a => a.requestStatus === "Pending").length;
    const acceptedAppointments = appointments.filter(a => a.requestStatus === "Accepted").length;
    const rejectedAppointments = appointments.filter(a => a.requestStatus === "Rejected").length;
    const completedAppointments = appointments.filter(a => a.requestStatus === "Completed").length;

    // Upcoming appointments
    const now = new Date();
    const upcomingAppointments = appointments.filter(a => 
      a.appointmentDate && 
      new Date(a.appointmentDate) > now && 
      a.requestStatus === "Accepted"
    ).slice(0, 5);

    // Past appointments
    const pastAppointments = appointments.filter(a => 
      a.appointmentDate && 
      new Date(a.appointmentDate) < now && 
      a.requestStatus === "Completed"
    );

    // Get unique doctors consulted
    const doctorIds = [...new Set(appointments.map(a => a.doctorId._id.toString()))];
    const totalDoctorsConsulted = doctorIds.length;

    // Payment statistics
    const payments = await Payment.find({
      patientId,
      paymentStatus: "Completed"
    });

    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = await Payment.countDocuments({
      patientId,
      paymentStatus: "Pending"
    });

    // Monthly spending
    const monthlySpending = await Payment.aggregate([
      {
        $match: {
          patientId: new mongoose.Types.ObjectId(patientId),
          paymentStatus: "Completed"
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }
    ]);

    // Skin predictions history
    const predictions = await SkinPrediction.find({ patientId })
      .sort({ createdAt: -1 });

    const totalPredictions = predictions.length;
    
    // Prediction statistics
    const predictionStats = {
      total: totalPredictions,
      byDisease: predictions.reduce((acc: any, p) => {
        acc[p.predictedDisease] = (acc[p.predictedDisease] || 0) + 1;
        return acc;
      }, {}),
      averageConfidence: predictions.length > 0
        ? Number((predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length).toFixed(2))
        : 0
    };

    // Recent predictions
    const recentPredictions = predictions.slice(0, 5);

    // Prescriptions
    const prescriptions = await Medicine.find({ patientId })
      .populate('doctorId', 'name specialization')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    const totalPrescriptions = prescriptions.length;
    const recentPrescriptions = prescriptions.slice(0, 5);

    // Consultations/Chats
    const consultations = await Consultation.find({ patientId })
      .populate('doctorId', 'name specialization')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    const totalChats = consultations.length;
    const unreadMessages = consultations.filter(c => !c.read).length; 

    // Feedback given
    const feedbacks = await Feedback.find({ patientId });
    const totalFeedbacks = feedbacks.length;

    // Favorite doctors (most consulted)
    const doctorConsultCount = appointments.reduce((acc: any, a) => {
      const doctorId = a.doctorId._id.toString();
      acc[doctorId] = (acc[doctorId] || 0) + 1;
      return acc;
    }, {});

    const favoriteDoctors = await Promise.all(
      Object.entries(doctorConsultCount)
        .sort(([,a]: any, [,b]: any) => b - a)
        .slice(0, 3)
        .map(async ([docId, count]) => {
          const doctor = await Doctor.findById(docId).select('name specialization image');
          return {
            doctor,
            consultations: count
          };
        })
    );

    // Next appointment
    const nextAppointment = appointments.find(a => 
      a.appointmentDate && 
      new Date(a.appointmentDate) > now && 
      a.requestStatus === "Accepted"
    );

    // Health timeline (appointments + predictions + prescriptions)
    const timeline = [
      ...appointments.map(a => ({
        type: 'appointment',
        date: a.appointmentDate || a.createdAt,
        title: `Appointment with Dr. ${(a.doctorId as any).name}`,
        status: a.requestStatus,
        data: a
      })),
      ...predictions.map(p => ({
        type: 'prediction',
        date: p.createdAt,
        title: `Skin Analysis: ${p.predictedDisease}`,
        confidence: p.confidence,
        data: p
      })),
      ...prescriptions.map(p => ({
        type: 'prescription',
        date: p.createdAt,
        title: `Prescription from Dr. ${(p.doctorId as any).name}`,
        data: p
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      success: true,
      data: {
        patient: {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          age: patient.age,
          gender: patient.gender,
          mobileNumber: patient.mobileNumber,
          address: patient.address,
          image: patient.image,
          accountCreatedAt: patient.accountCreatedAt
        },
        overview: {
          totalAppointments,
          pendingAppointments,
          acceptedAppointments,
          rejectedAppointments,
          completedAppointments,
          totalDoctorsConsulted,
          totalSpent,
          pendingPayments,
          totalPredictions,
          totalPrescriptions,
          totalChats,
          unreadMessages,
          totalFeedbacks
        },
        appointments: {
          upcoming: upcomingAppointments,
          past: pastAppointments.slice(0, 5),
          stats: {
            pending: pendingAppointments,
            accepted: acceptedAppointments,
            rejected: rejectedAppointments,
            completed: completedAppointments
          },
          nextAppointment: nextAppointment ? {
            ...nextAppointment.toObject(),
            doctor: nextAppointment.doctorId
          } : null
        },
        doctors: {
          total: totalDoctorsConsulted,
          favorite: favoriteDoctors,
          list: doctorIds.slice(0, 5) // Recently consulted
        },
        payments: {
          total: totalSpent,
          pending: pendingPayments,
          monthly: monthlySpending,
          recent: payments.slice(0, 5)
        },
        predictions: {
          total: totalPredictions,
          stats: predictionStats,
          recent: recentPredictions,
          history: predictions
        },
        prescriptions: {
          total: totalPrescriptions,
          recent: recentPrescriptions,
          all: prescriptions
        },
        consultations: {
          total: totalChats,
          unread: unreadMessages,
          recent: consultations.slice(0, 5)
        },
        timeline: timeline.slice(0, 10) // Recent 10 activities
      }
    });
  })
);

/* GET APPOINTMENT HISTORY */
router.get(
  "/appointments/:patientId",
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const { status } = req.query;

    let query: any = { patientId };
    if (status) {
      query.requestStatus = status;
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'name specialization image consultationFee hospitalName experience')
      .sort({ appointmentDate: -1 });

    // Group by status
    const grouped = {
      pending: appointments.filter(a => a.requestStatus === "Pending"),
      accepted: appointments.filter(a => a.requestStatus === "Accepted"),
      rejected: appointments.filter(a => a.requestStatus === "Rejected"),
      completed: appointments.filter(a => a.requestStatus === "Completed")
    };

    res.json({
      success: true,
      data: {
        total: appointments.length,
        grouped,
        all: appointments
      }
    });
  })
);

/* GET DOCTORS CONSULTED */
router.get(
  "/doctors/:patientId",
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patientId })
      .populate('doctorId')
      .sort({ createdAt: -1 });

    // Get unique doctors with consultation stats
    const doctorMap = new Map();
    
    appointments.forEach(app => {
      const docId = app.doctorId._id.toString();
      if (!doctorMap.has(docId)) {
        doctorMap.set(docId, {
          doctor: app.doctorId,
          consultations: 0,
          lastVisit: app.appointmentDate,
          totalSpent: 0,
          status: app.requestStatus
        });
      }
      
      const doc = doctorMap.get(docId);
      doc.consultations += 1;
      if (new Date(app.appointmentDate) > new Date(doc.lastVisit)) {
        doc.lastVisit = app.appointmentDate;
      }
    });

    // Add payment info
    for (let [docId, data] of doctorMap.entries()) {
      const payments = await Payment.find({
        patientId,
        doctorId: docId,
        paymentStatus: "Completed"
      });
      data.totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
    }

    res.json({
      success: true,
      data: {
        total: doctorMap.size,
        doctors: Array.from(doctorMap.values())
      }
    });
  })
);

/* GET PREDICTION HISTORY */
router.get(
  "/predictions/:patientId",
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const predictions = await SkinPrediction.find({ patientId })
      .sort({ createdAt: -1 });

    // Calculate accuracy trends
    const monthlyAccuracy = predictions.reduce((acc: any, p) => {
      const month = new Date(p.createdAt).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { total: 0, sum: 0 };
      }
      acc[month].total += 1;
      acc[month].sum += p.confidence || 0;
      return acc;
    }, {});

    const trends = Object.entries(monthlyAccuracy).map(([month, data]: [string, any]) => ({
      month,
      averageConfidence: Number((data.sum / data.total).toFixed(2)),
      count: data.total
    }));

    res.json({
      success: true,
      data: {
        total: predictions.length,
        history: predictions,
        trends,
        byDisease: predictions.reduce((acc: any, p) => {
          acc[p.predictedDisease] = (acc[p.predictedDisease] || 0) + 1;
          return acc;
        }, {})
      }
    });
  })
);

/* GET PRESCRIPTION HISTORY */
router.get(
  "/prescriptions/:patientId",
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const prescriptions = await Medicine.find({ patientId })
      .populate('doctorId', 'name specialization')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    // Group by doctor
    const byDoctor = prescriptions.reduce((acc: any, p) => {
      const docName = (p.doctorId as any).name;
      if (!acc[docName]) {
        acc[docName] = {
          doctor: p.doctorId,
          count: 0,
          prescriptions: []
        };
      }
      acc[docName].count += 1;
      acc[docName].prescriptions.push(p);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: prescriptions.length,
        recent: prescriptions.slice(0, 5),
        byDoctor,
        all: prescriptions
      }
    });
  })
);

/* GET PAYMENT HISTORY */
router.get(
  "/payments/:patientId",
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const payments = await Payment.find({ patientId })
      .populate('doctorId', 'name specialization')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    const totalSpent = payments
      .filter(p => p.paymentStatus === "Completed")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payments
      .filter(p => p.paymentStatus === "Pending")
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      data: {
        total: payments.length,
        totalSpent,
        pendingAmount,
        completed: payments.filter(p => p.paymentStatus === "Completed").length,
        failed: payments.filter(p => p.paymentStatus === "Failed").length,
        pending: payments.filter(p => p.paymentStatus === "Pending").length,
        history: payments
      }
    });
  })
);

export default router;