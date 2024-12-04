import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References users who liked the tweet
      },
    ],
    media: {
      type: String, // URL to the user's avatar image stored in Cloudinary
    },
  },
  { timestamps: true },
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
