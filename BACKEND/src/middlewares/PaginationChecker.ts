import { NextFunction, Request, Response } from "express";

/**
 * @description Middleware to check if the user has provided the pagination query params or not and if not then set the default values
 */
export const paginationChecker = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { page, limit } = req.query as { page: string; limit: string };

  if (!page) page = "1";
  if (!limit) limit = "5";

  req.query.page = page;
  req.query.limit = limit;

  next();
};
