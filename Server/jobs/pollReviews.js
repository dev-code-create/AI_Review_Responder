// jobs/pollReviews.js
import axios from "axios";
import Business from "../models/Business.js";
import Review from "../models/Review.js";

async function pollGoogleReviews(business) {
  const { locationId, accessToken } = business.googleBusinessProfile;

  const { data } = await axios.get(
    `https://mybusiness.googleapis.com/v4/${locationId}/reviews`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  for (const r of data.reviews || []) {
    const exists = await Review.findOne({ externalId: r.reviewId });
    if (exists) continue;

    const review = await Review.create({
      business: business._id,
      platform: "google",
      externalId: r.reviewId,
      authorName: r.reviewer?.displayName,
      rating: r.starRating,
      text: r.comment,
      status: "pending",
    });

    const { data: draftRes } = await axios.post(
      "http://localhost:8000/draft-reply",
      {
        business_id: business._id.toString(),
        review_text: review.text,
        rating: review.rating,
        platform: "google",
      },
    );

    review.draftReply = draftRes.draft;
    await review.save();
  }
}

async function pollAll() {
  const businesses = await Business.find({
    "googleBusinessProfile.locationId": { $ne: null },
  });
  for (const b of businesses) await pollGoogleReviews(b);
}

export { pollAll };
