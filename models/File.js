const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["image", "video", "file"],
      required: true,
    },

    url: { type: String, required: true },
    fileName: String,
    mimeType: String,
    size: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema, "files");
