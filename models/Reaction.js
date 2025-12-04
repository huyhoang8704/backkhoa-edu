const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["like", "clap"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reaction", reactionSchema, "reactions");
