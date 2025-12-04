const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    summary: String,
    content: { type: String, required: true },
    thumbnailUrl: String,

    type: {
      type: String,
      enum: ["post", "page", "article", "news", "video"],
      default: "post",
    },

    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },

    scheduledAt: Date,

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],

    // Collection riêng → Lưu ObjectId
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
      }
    ],

    views: { type: Number, default: 0 },

    reactions: {
      likes: { type: Number, default: 0 },
      claps: { type: Number, default: 0 },
    },

    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    publishedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema, "posts");
