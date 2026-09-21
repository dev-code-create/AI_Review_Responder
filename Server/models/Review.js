// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    platform: { type: String, enum: ["google", "yelp"], default: "google" },
    externalId: { type: String, required: true },
    authorName: String,
    rating: { type: Number, min: 1, max: 5 },
    text: String,

    draftReply: String,
    status: {
      type: String,
      enum: ["pending", "approved", "posted", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Review", reviewSchema);
