// doctor.stats.routes.ts
import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Appointment } from "../models/appointment.model";
import { Doctor } from "../models/doctor.model";
import { Patient } from "../models/user.model";
import { Payment } from "../models/payment.model";
import { Feedback } from "../models/feedback.model";
import { Consultation } from "../models/consultation.model";
import { Medicine } from "../models/medicine.model";
import { BadRequest } from "../customErrors";
import mongoose from "mongoose";

const router = Router();

// ==================== DOCTOR DASHBOARD STATS ====================

/* GET COMPLETE DOCTOR DASHBOARD STATS */
router.get(
    "/dashboard/:doctorId",
    asyncHandler(async (req: Request, res: Response) => {
        const { doctorId } = req.params;
        const { period } = req.query; // daily, weekly, monthly, yearly, all

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            throw new BadRequest("Invalid doctor ID");
        }

        // Check if doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            throw new BadRequest("Doctor not found");
        }

        // Date range based on period
        const now = new Date();
        let startDate = new Date(now);

        switch (period) {
            case 'daily':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'monthly':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'yearly':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default: // all time - use a very old date
                startDate = new Date(0);
        }

        // Get all appointments
        const appointments = await Appointment.find({
            doctorId,
            createdAt: { $gte: startDate }
        });

        // Appointment statistics
        const totalAppointments = appointments.length;
        const pendingAppointments = appointments.filter(a => a.requestStatus === "Pending").length;
        const acceptedAppointments = appointments.filter(a => a.requestStatus === "Accepted").length;
        const rejectedAppointments = appointments.filter(a => a.requestStatus === "Rejected").length;
        const completedAppointments = appointments.filter(a => a.requestStatus === "Completed").length;

        // Today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppointments = await Appointment.find({
            doctorId,
            appointmentDate: { $gte: today, $lt: tomorrow }
        }).populate('patientId', 'name age gender image');

        // Upcoming appointments (next 7 days)
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        const upcomingAppointments = await Appointment.find({
            doctorId,
            appointmentDate: { $gte: now, $lte: nextWeek },
            requestStatus: "Accepted"
        })
            .populate('patientId', 'name age gender image')
            .sort({ appointmentDate: 1 });

        // Patient statistics
        const uniquePatientIds = await Appointment.distinct('patientId', { doctorId });
        const totalPatients = uniquePatientIds.length;

        // New patients this period
        const newPatients = await Appointment.distinct('patientId', {
            doctorId,
            createdAt: { $gte: startDate }
        });

        // Get patient details
        const patients = await Patient.find({
            _id: { $in: uniquePatientIds }
        }).select('name age gender image');

        // Patient demographics
        const demographics = {
            ageGroups: {
                '0-18': patients.filter(p => p.age && p.age <= 18).length,
                '19-30': patients.filter(p => p.age && p.age > 18 && p.age <= 30).length,
                '31-50': patients.filter(p => p.age && p.age > 30 && p.age <= 50).length,
                '50+': patients.filter(p => p.age && p.age > 50).length,
                'unknown': patients.filter(p => !p.age).length
            },
            gender: {
                male: patients.filter(p => p.gender?.toLowerCase() === 'male').length,
                female: patients.filter(p => p.gender?.toLowerCase() === 'female').length,
                other: patients.filter(p => p.gender && !['male', 'female'].includes(p.gender.toLowerCase())).length,
                unknown: patients.filter(p => !p.gender).length
            }
        };

        // Payment statistics
        const payments = await Payment.find({
            doctorId,
            paymentStatus: "Completed",
            createdAt: { $gte: startDate }
        });

        const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
        const pendingPayments = await Payment.countDocuments({
            doctorId,
            paymentStatus: "Pending"
        });

        // Monthly earnings breakdown
        const monthlyEarnings = await Payment.aggregate([
            {
                $match: {
                    doctorId: new mongoose.Types.ObjectId(doctorId),
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
            { $limit: 12 }
        ]);

        // Feedback statistics
        const feedbacks = await Feedback.find({ doctorId });
        const totalFeedbacks = feedbacks.length;
        const averageRating = totalFeedbacks > 0
            ? Number((feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1))
            : 0;

        // Rating distribution
        const ratingDistribution = {
            5: feedbacks.filter(f => f.rating === 5).length,
            4: feedbacks.filter(f => f.rating === 4).length,
            3: feedbacks.filter(f => f.rating === 3).length,
            2: feedbacks.filter(f => f.rating === 2).length,
            1: feedbacks.filter(f => f.rating === 1).length
        };

        // Recent feedback
        const recentFeedback = await Feedback.find({ doctorId })
            .populate('patientId', 'name image')
            .sort({ createdAt: -1 })
            .limit(5);

        // Consultation statistics
        const consultations = await Consultation.find({
            doctorId,
            createdAt: { $gte: startDate }
        });

        const consultationTypes = {
            Chat: consultations.filter(c => c.consultationType === "Chat").length,
            Video: consultations.filter(c => c.consultationType === "Video").length
        };

        // Medicine prescriptions
        const prescriptions = await Medicine.find({
            doctorId,
            createdAt: { $gte: startDate }
        });

        const totalPrescriptions = prescriptions.length;

        // Common symptoms analysis
        const symptomsAnalysis = await Appointment.aggregate([
            {
                $match: {
                    doctorId: new mongoose.Types.ObjectId(doctorId),
                    symptoms: { $exists: true, $ne: "" }
                }
            },
            {
                $group: {
                    _id: "$symptoms",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Response time analysis (time between creation and acceptance)
        const responseTimes = appointments
            .filter(a => a.requestStatus === "Accepted" && a.updatedAt)
            .map(a => {
                const created = new Date(a.createdAt).getTime();
                const updated = new Date(a.updatedAt).getTime();
                return (updated - created) / (1000 * 60); // in minutes
            });

        const avgResponseTime = responseTimes.length > 0
            ? Number((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(0))
            : 0;

        res.json({
            success: true,
            data: {
                doctor: {
                    id: doctor._id,
                    name: doctor.name,
                    image:doctor.image,
                    specialization: doctor.specialization,
                    consultationFee: doctor.consultationFee,
                    hospitalName: doctor.hospitalName,
                    experience: doctor.experience,
                    accountStatus: doctor.accountStatus
                },
                overview: {
                    totalAppointments,
                    pendingAppointments,
                    acceptedAppointments,
                    rejectedAppointments,
                    completedAppointments,
                    totalPatients,
                    newPatients: newPatients.length,
                    totalEarnings,
                    averageRating,
                    totalFeedbacks,
                    totalPrescriptions,
                    avgResponseTime
                },
                appointments: {
                    today: todayAppointments,
                    upcoming: upcomingAppointments,
                    stats: {
                        pending: pendingAppointments,
                        accepted: acceptedAppointments,
                        rejected: rejectedAppointments,
                        completed: completedAppointments
                    }
                },
                patients: {
                    total: totalPatients,
                    demographics,
                    list: patients.slice(0, 10) // Recent 10 patients
                },
                earnings: {
                    total: totalEarnings,
                    pending: pendingPayments,
                    monthly: monthlyEarnings
                },
                feedback: {
                    average: averageRating,
                    total: totalFeedbacks,
                    distribution: ratingDistribution,
                    recent: recentFeedback
                },
                consultations: {
                    total: consultations.length,
                    types: consultationTypes
                },
                analytics: {
                    commonSymptoms: symptomsAnalysis,
                    responseTime: avgResponseTime
                }
            }
        });
    })
);

/* GET APPOINTMENT STATS */
router.get(
    "/appointments/:doctorId",
    asyncHandler(async (req: Request, res: Response) => {
        const { doctorId } = req.params;
        const { status, from, to } = req.query;

        let query: any = { doctorId };

        if (status) {
            query.requestStatus = status;
        }

        if (from || to) {
            query.appointmentDate = {};
            if (from) query.appointmentDate.$gte = new Date(from as string);
            if (to) query.appointmentDate.$lte = new Date(to as string);
        }

        const appointments = await Appointment.find(query)
            .populate('patientId', 'name age gender image mobileNumber')
            .sort({ appointmentDate: -1 });

        const stats = {
            total: appointments.length,
            pending: appointments.filter(a => a.requestStatus === "Pending").length,
            accepted: appointments.filter(a => a.requestStatus === "Accepted").length,
            rejected: appointments.filter(a => a.requestStatus === "Rejected").length,
            completed: appointments.filter(a => a.requestStatus === "Completed").length
        };

        res.json({
            success: true,
            data: {
                appointments,
                stats
            }
        });
    })
);

/* GET EARNINGS STATS */
router.get(
    "/earnings/:doctorId",
    asyncHandler(async (req: Request, res: Response) => {
        const { doctorId } = req.params;
        const { year } = req.query;

        const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31);

        const payments = await Payment.find({
            doctorId,
            paymentStatus: "Completed",
            paymentDate: { $gte: startDate, $lte: endDate }
        });

        // Monthly breakdown
        const monthlyData = Array(12).fill(0).map((_, i) => {
            const monthPayments = payments.filter(p =>
                new Date(p.paymentDate).getMonth() === i
            );
            return {
                month: i + 1,
                total: monthPayments.reduce((sum, p) => sum + p.amount, 0),
                count: monthPayments.length
            };
        });

        // Total earnings
        const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

        // Average per consultation
        const avgPerConsultation = payments.length > 0
            ? totalEarnings / payments.length
            : 0;

        res.json({
            success: true,
            data: {
                year: currentYear,
                totalEarnings,
                totalConsultations: payments.length,
                avgPerConsultation,
                monthly: monthlyData
            }
        });
    })
);

/* GET PATIENT STATS */
router.get(
    "/patients/:doctorId",
    asyncHandler(async (req: Request, res: Response) => {
        const { doctorId } = req.params;

        // Get all patients who have consulted this doctor
        const patientIds = await Appointment.distinct('patientId', { doctorId });

        const patients = await Patient.find({
            _id: { $in: patientIds }
        }).select('-password');

        // Get consultation count per patient
        const patientStats = await Promise.all(
            patients.map(async (patient) => {
                const appointments = await Appointment.find({
                    doctorId,
                    patientId: patient._id
                }).sort({ appointmentDate: -1 });

                const totalConsultations = appointments.length;
                const lastConsultation = appointments[0]?.appointmentDate;
                const totalPayments = await Payment.aggregate([
                    {
                        $match: {
                            doctorId: new mongoose.Types.ObjectId(doctorId),
                            patientId: patient._id,
                            paymentStatus: "Completed"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$amount" }
                        }
                    }
                ]);

                return {
                    patient,
                    stats: {
                        totalConsultations,
                        lastConsultation,
                        totalSpent: totalPayments[0]?.total || 0,
                        appointments: appointments.slice(0, 5) // Last 5 appointments
                    }
                };
            })
        );

        res.json({
            success: true,
            data: patientStats
        });
    })
);

export default router;