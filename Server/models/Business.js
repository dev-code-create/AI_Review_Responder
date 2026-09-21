// models/Business.js
const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["clinic", "restaurant", "shop", "other"],
      required: true,
    },
    ownerEmail: { type: String, required: true },

    // The "voice profile" — this is what makes replies sound like THEM, not a generic bot
    voiceProfile: {
      toneWords: [String], // e.g. ["warm", "brief", "no exclamation marks"]
      signOff: String, // e.g. "– Dr. Mehta's Clinic"
      doNotMention: [String], // e.g. ["never mention refunds directly"]
      sampleReplies: [String], // 5-10 past replies the owner actually likes/wrote
    },

    googleBusinessProfile: {
      locationId: String,
      accessToken: String, // store encrypted in production
      refreshToken: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Business", businessSchema);
