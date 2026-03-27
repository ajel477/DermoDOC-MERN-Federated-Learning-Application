import asyncHandler from "../middlewares/AsyncHandler";
import { Request, Response, Router } from "express";
import { Feedback } from "../models/feedback.model";

const router = Router();

/* ADD FEEDBACK */
router.post(
  "/add",
  asyncHandler(async (req: Request, res: Response) => {
    const feedback = await Feedback.create(req.body);

    res.json({
      msg: "Feedback submitted",
      feedback,
    });
  })
);

/* VIEW DOCTOR FEEDBACK */
router.get(
  "/doctor/:doctorId",
  asyncHandler(async (req: Request, res: Response) => {
    const feedbacks = await Feedback.find({
      doctorId: req.params.doctorId,
    });

    res.json(feedbacks);
  })
);

export default router;