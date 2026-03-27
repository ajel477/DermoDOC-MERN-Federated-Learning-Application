import { NextFunction, Request, Response } from "express";
import CONFIG from "../config";
import jwt from "jsonwebtoken";
import { CookieSetter } from "./CookieSetter";
import { _401, Unauthorized } from "../customErrors";
import { RoleEnum, TokenInfo } from "../types";
import { Admin, Patient } from "../models";
import { Model } from "mongoose";
import { Doctor } from "../models/doctor.model";


// URLs to ignore authentication
const TO_IGNORE_URLS = [
  "/api/auth/login",
  "/api/auth/register",

];

/**
 * @description Middleware to check if the user is authenticated or not by verifying the JWT token from the cookie.
 * It also sets the user in the `req` object for further use and ensures the user is active.
 */
export const memberAuthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip authentication for specific URLs
  const normalizedUrl = req.url.split("?")[0];
  if (TO_IGNORE_URLS.some(url =>
    url === normalizedUrl ||
    (url.includes(":") && new RegExp(`^${url.replace(/:[^/]+/g, "[^/]+")}$`).test(normalizedUrl))
  )) {
    console.log(`Skipping auth for URL: ${normalizedUrl}`);
    return next();
  }

  // Extract token from cookies
  const token = req.cookies["token"];

  if (!token) {
    return res.status(_401).json({
      message: "No token found",
    });
  }

  try {
    // Verify the token
    const user = jwt.verify(token, CONFIG.JWT_SECRET) as TokenInfo;

    if (!user) {
      return res.status(_401).json({
        message: "Invalid token",
      });
    }

    // Determine the model to use based on the user's role
    let modelToUse: typeof Model | null = null;

    switch (user.role) {
      case RoleEnum.ADMIN:
        modelToUse = Admin;
        break;
      case RoleEnum.DOCTOR:
        modelToUse = Doctor;
        break;
      case RoleEnum.PATIENT:
        modelToUse = Patient;
        break;
      default:
        modelToUse = null;
        break;
    }

    if (!modelToUse) {
      throw new Unauthorized("Invalid role");
    }

    // Find the user in the database
    const result = await modelToUse.findById(user._id);

    if (!result) {
      throw new Unauthorized("User not found");
    }

    // Attach the user to the request object
    req.user = user;

    // Set the token in the cookie (optional, for refreshing the token)
    await CookieSetter(req, res, () => { });

    // Proceed to the next middleware or route handler
    next();
  } catch (error: any) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(_401).json({ message: "Please login again, session expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(_401).json({ message: "Token manipulation detected" });
    } else {
      return res.status(_401).json({ message: error.message || "Authentication failed" });
    }
  }
};