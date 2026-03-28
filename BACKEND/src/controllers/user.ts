import asyncHandler from "../middlewares/AsyncHandler";
import { CookieOptions, Request, Response, Router } from "express";
import bcrypt from "bcrypt";

import { validate, dbUserDelete } from "../middlewares/Validator";

import {
  idValidater,
  loginValidator,
  roleParamsValidater,
  forgotPasswordValidator,
} from "../validators";

import { IBaseUser, Patient, Admin } from "../models";
import { RoleEnum, Role } from "../types";
import { BadRequest } from "../customErrors";

import {
  generateJwtToken,
  getModelByRole,
  getUserByRole,
  uploadLocal,
  sendMail,
} from "../constants/lib";

import CONFIG from "../config";
import { Doctor } from "../models/doctor.model";

const router = Router();

type AddUser = IBaseUser & {
  role: Role;
  password?: string;
  mobileNumber?: string;
  address?: string;
  specialization?: string;
  experience?: number;
  hospitalName?: string;
  consultationFee?: string
};

type ChangePassword = {
  newPassword: string;
  role: Role;
};

type UserFilterDropdown = {
  q: string;
  role: Role;
};

//////////////////////////////////////////////////////
// GET CURRENT USER
//////////////////////////////////////////////////////

router.get(
  "/me",
  asyncHandler(async (req: Request, res: Response) => {
    const { _id: userId, role } = req.user;

    const model = getModelByRole(role);
    if (!model) throw new BadRequest("Invalid role");

    const user = await model.findById(userId).select("-password");
    if (!user) throw new BadRequest("User not found");

    res.json(user);
  })
);

//////////////////////////////////////////////////////
// GET ALL PATIENTS
//////////////////////////////////////////////////////

router.get(
  "/patients",
  asyncHandler(async (_req: Request, res: Response) => {
    const patients = await Patient.find({});
    res.json({ patients });
  })
);

//////////////////////////////////////////////////////
// GET ALL DOCTORS
//////////////////////////////////////////////////////

router.get(
  "/doctors",
  asyncHandler(async (_req: Request, res: Response) => {
    const doctors = await Doctor.find({ isAccepted: true });
    res.json({ doctors });
  })
);

//////////////////////////////////////////////////////
// DROPDOWN SEARCH
//////////////////////////////////////////////////////

router.get(
  "/dropdown",
  validate(roleParamsValidater),
  asyncHandler(async (req: Request, res: Response) => {
    const { q, role } = req.query as UserFilterDropdown;

    let query: any = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const model = getModelByRole(role);
    if (!model) throw new BadRequest("Invalid role");

    const users = await model.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $project: { _id: 1, name: 1 } },
    ]);

    res.json(users);
  })
);

//////////////////////////////////////////////////////
// REGISTER (PATIENT / DOCTOR)
//////////////////////////////////////////////////////

router.post(
  "/register",
  uploadLocal.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      email,
      role,
      password,
      mobileNumber,
      address,
      specialization,
      experience,
      hospitalName,
      consultationFee
    } = req.body as AddUser;

    const file = req.file;

    if (!name || !email || !password || !mobileNumber || !role)
      throw new BadRequest("Required fields missing");

    const existing = await Promise.all([
      Patient.findOne({ email }),
      Doctor.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    if (existing.some((u) => u))
      throw new BadRequest("Email already exists");

    const hashedPassword = await bcrypt.hash(
      password,
      CONFIG.SALT_ROUNDS || 10
    );

    const baseUser = {
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      address,
      image: file ? `${CONFIG.HOST}/static/uploads/${file.filename}` : "",
      accountStatus: "Active",
      accountCreatedAt: new Date(),
      statusUpdatedAt: new Date(),
    };

    let newUser;
    let msg = "";

    switch (role) {
      case RoleEnum.PATIENT:
        newUser = await Patient.create(baseUser);
        msg = "Patient registered successfully";
        break;

      case RoleEnum.DOCTOR:
        newUser = await Doctor.create({
          ...baseUser,
          specialization,
          consultationFee,
          experience,
          hospitalName,
          isAccepted: false,
          accountStatus: "Active",
        });

        msg = "Doctor registered successfully. Awaiting admin approval.";

        // Send registration email
        sendMail(email, "Doctor Registration Successful - Pending Approval", "doctor-registration.html", {
          name,
          clientUrl: CONFIG.CLIENT_URL,
        });

        break;

      default:
        throw new BadRequest("Invalid role");
    }

    const { password: _, ...userResponse } = newUser.toObject();

    res.status(201).json({
      msg,
      user: userResponse,
    });
  })
);

//////////////////////////////////////////////////////
// LOGIN
//////////////////////////////////////////////////////

router.post(
  "/login",
  validate(loginValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role } = req.body as AddUser;

    const user: any = await getUserByRole(role, { email });

    if (!user) throw new BadRequest("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequest("Invalid password");

    if (user.isAccepted === false)
      return res.status(403).json({
        message: "Your account is awaiting admin approval",
      });

    const token = generateJwtToken(user as IBaseUser, role);

    res.cookie("token", token, CONFIG.COOKIE_SETTINGS as CookieOptions);

    user.lastLogin = new Date();
    await user.save();

    res.json({
      msg: "Logged in successfully",
      user: {
        name: user.name,
        email: user.email,
        _id: user._id,
        role,
      },
    });
  })
);

//////////////////////////////////////////////////////
// CHANGE PASSWORD
//////////////////////////////////////////////////////

router.post(
  "/change-password",
  validate(forgotPasswordValidator),
  asyncHandler(async (req: Request, res: Response) => {
    const { newPassword, role } = req.body as ChangePassword;
    const { email } = req.user;

    const user = await getUserByRole(role, { email });
    if (!user) throw new BadRequest("User not found");

    const hashed = await bcrypt.hash(newPassword, CONFIG.SALT_ROUNDS);

    await user.updateOne({ password: hashed });

    res.json({ msg: "Password changed successfully" });
  })
);

//////////////////////////////////////////////////////
// UPDATE PROFILE
//////////////////////////////////////////////////////

router.patch(
  "/update-profile",
  uploadLocal.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    const { _id, role } = req.user;

    const {
      name,
      mobileNumber,
      address,
      age,
      gender,
      email,
      specialization,
      experience,
      hospitalName,
      consultationFee,
    } = req.body;

    const model = getModelByRole(role);

    if (!model) throw new BadRequest("Invalid role");

    const updateData: any = {
      ...(name && { name }),
      ...(mobileNumber && { mobileNumber }),
      ...(address && { address }),
      ...(age && { age }),
      ...(gender && { gender }),
      ...(email && { email }),
      ...(specialization && { specialization }),
      ...(experience && { experience }),
      ...(hospitalName && { hospitalName }),
      ...(consultationFee && { consultationFee }),
    };

    if (req.file) {
      updateData.image = `${CONFIG.HOST}/static/uploads/${req.file.filename}`;
    }

    const user = await model.findByIdAndUpdate(_id, updateData, {
      new: true,
    });

    if (!user) throw new BadRequest("User not found");

    const { password, ...cleanUser } = user.toObject();

    res.json({
      msg: "Profile updated successfully",
      user: cleanUser,
    });
  })
);



//////////////////////////////////////////////////////
// DELETE USER
//////////////////////////////////////////////////////

router.delete(
  "/:id",
  validate(idValidater),
  validate(roleParamsValidater),
  dbUserDelete(true),
  asyncHandler(async (_req: Request, res: Response) => {
    res.json({ msg: "User deleted successfully" });
  })
);

//////////////////////////////////////////////////////
// CHECK EMAIL AVAILABILITY
//////////////////////////////////////////////////////

router.get(
  "/check-email",
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email) {
      throw new BadRequest("Email is required");
    }

    const existing = await Promise.all([
      Patient.findOne({ email }),
      Doctor.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    const available = !existing.some((u) => u);

    res.json({
      available,
      message: available ? "Email is available" : "Email already exists",
    });
  })
);

//////////////////////////////////////////////////////
// CHECK MOBILE AVAILABILITY
//////////////////////////////////////////////////////

router.get(
  "/check-mobile",
  asyncHandler(async (req: Request, res: Response) => {
    const { mobileNumber } = req.query;

    if (!mobileNumber) {
      throw new BadRequest("Mobile number is required");
    }

    const existing = await Promise.all([
      Patient.findOne({ mobileNumber }),
      Doctor.findOne({ mobileNumber }),
      Admin.findOne({ mobileNumber }),
    ]);

    const available = !existing.some((u) => u);

    res.json({
      available,
      message: available ? "Mobile number is available" : "Mobile number already exists",
    });
  })
);

export default router;