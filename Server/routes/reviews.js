// routes/reviews.js
import { Router } from "express";
import axios from "axios";
import Review from "../models/Review.js";

const router = Router();

router.put("/:id/approve", async (req, res) => {
  const review = await Review.findById(req.params.id).populate("business");
  const finalText = req.body.editedText || review.draftReply;

  await axios.put(
    `https://mybusiness.googleapis.com/v4/${review.externalId}/reply`,
    { comment: finalText },
    {
      headers: {
        Authorization: `Bearer ${review.business.googleBusinessProfile.accessToken}`,
      },
    },
  );

  review.draftReply = finalText;
  review.status = "posted";
  await review.save();

  res.json({ success: true });
});

export default router;
