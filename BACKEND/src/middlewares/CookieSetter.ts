import { Request, Response, NextFunction, CookieOptions } from "express";
import CONFIG from "../config";
import { generateJwtToken } from "../constants/lib";

/**
 * @description Set the token in the cookie of the browser
 *
 */
export const CookieSetter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = generateJwtToken(req.user, req.user.role);

  // set developer signature in the token MT
  //set the token in the cookie
  res.cookie("token", token, CONFIG.COOKIE_SETTINGS as CookieOptions);
  next();
};
