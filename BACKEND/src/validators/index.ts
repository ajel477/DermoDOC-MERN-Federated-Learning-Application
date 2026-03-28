import { param, body, query } from "express-validator";
import { RoleEnum as ROLES } from "../types";

export const idValidater = [
  param("id").isMongoId().withMessage("Id must be a valid mongo id"),
];

export const roleValidater = [
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const roleParamsValidater = [
  query("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const roleWithQParamsValidater = [
  query("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),

  query("q").optional().isString().withMessage("Query must be a string"),
];

export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];

export const forgotPasswordValidator = [
  body("newPassword")
    .notEmpty()
    .withMessage("New Password is required")
    .isLength({ min: 6, max: 20 })
    .withMessage("New Password must be between 6 and 20 characters"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Role must be in " + Object.values(ROLES).join(", ")),
];



