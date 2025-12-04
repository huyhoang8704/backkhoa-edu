const Post = require("../models/Post");
const File = require("../models/File");
const Category = require("../models/Category");
const Tag = require("../models/Tag");

const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/space");
const slugify = require("slugify");

const BUCKET_NAME = "qldapm";
const CDN_URL = "https://qldapm.sgp1.digitaloceanspaces.com";


/** Normalize tags input */
function normalizeTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

/** Upload buffer to DO Spaces */
async function uploadToS3(buffer, key, mime) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mime,
      ACL: "public-read",
    })
  );
  return `${CDN_URL}/${key}`;
}

/** Delete S3 object */
async function deleteFromS3(key) {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
  } catch (e) {
    console.warn("Failed to delete S3:", key, e.message);
  }
}

/** Ensure unique slug */
async function generateUniqueSlug(title) {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let count = 1;

  while (await Post.findOne({ slug })) {
    slug = `${base}-${count++}`;
    if (count > 1000) break;
  }
  return slug;
}

/** Validate & parse SEO */
function parseSeo(rawSeo) {
  if (!rawSeo) return {};
  if (typeof rawSeo === "object") return rawSeo;
  try {
    return JSON.parse(rawSeo);
  } catch {
    return {};
  }
}

exports.createPost = async (req, res) => {
  const uploadedKeys = [];
  const createdFileDocs = [];

  try {
    const {
      title,
      summary,
      content,
      type = "post",
      status = "draft",
      category,
      tags: rawTags,
      scheduledAt,
      seo: rawSeo,
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    if (!content?.trim()) return res.status(400).json({ message: "Content is required" });

    const allowedTypes = ["post", "page", "article", "news", "video"];
    const allowedStatus = ["draft", "published", "scheduled"];

    if (!allowedTypes.includes(type))
      return res.status(400).json({ message: "Invalid type" });

    if (!allowedStatus.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    let scheduleDate = null;
    if (status === "scheduled") {
      if (!scheduledAt) return res.status(400).json({ message: "scheduledAt required" });
      scheduleDate = new Date(scheduledAt);
      if (isNaN(scheduleDate)) return res.status(400).json({ message: "Invalid scheduledAt" });
    }

    const slug = await generateUniqueSlug(title);
    const tags = normalizeTags(rawTags);
    const seo = parseSeo(rawSeo);

    let categoryId = null;
    if (category) {
      const cat = await Category.findById(category);
      if (!cat) return res.status(404).json({ message: "Category not found" });
      categoryId = cat._id;
    }

    const validTags = await Tag.find({ _id: { $in: tags } });
    const tagIds = validTags.map((t) => t._id);


    // Upload thumbnail
    let thumbnailUrl = null;
    if (req.files?.thumbnail?.length > 0) {
      const file = req.files.thumbnail[0];
      const ext = file.originalname.split(".").pop();
      const key = `posts/thumbnails/${req.user.id}/${Date.now()}-${slug}.${ext}`;

      thumbnailUrl = await uploadToS3(file.buffer, key, file.mimetype);
      uploadedKeys.push(key);
    }

    // Upload files
    const fileIds = [];

    if (req.files?.files?.length > 0) {
      for (const file of req.files.files) {
        const nameNoExt = file.originalname.replace(/\.[^/.]+$/, "");
        const ext = file.originalname.split(".").pop();
        const key = `posts/files/${req.user.id}/${Date.now()}-${slugify(nameNoExt)}.${ext}`;

        const url = await uploadToS3(file.buffer, key, file.mimetype);
        uploadedKeys.push(key);

        const fileDoc = await File.create({
          user: req.user.id,
          type: file.mimetype.startsWith("image")
            ? "image"
            : file.mimetype.startsWith("video")
            ? "video"
            : "file",
          url,
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        });

        createdFileDocs.push(fileDoc._id);
        fileIds.push(fileDoc._id);
      }
    }

    /** ------------------------------
     * 5) Create Post
     * ------------------------------ */
    const post = await Post.create({
      author: req.user.id,
      title: title.trim(),
      slug,
      summary: summary || "",
      content,
      thumbnailUrl,
      type,
      status,
      scheduledAt: scheduleDate,
      category: categoryId,
      tags: tagIds,
      files: fileIds,
      seo,
      publishedAt: status === "published" ? new Date() : null,
    });

    /** ------------------------------
     * 6) Populate response
     * ------------------------------ */
    const populated = await Post.findById(post._id)
      .populate("author", "name email avatarUrl")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .populate("files");

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: populated,
    });
  } catch (err) {
    console.error("❌ Create Post Error:", err);

    /** Rollback DB */
    if (createdFileDocs.length > 0) {
      await File.deleteMany({ _id: { $in: createdFileDocs } });
    }

    /** Rollback S3 uploads */
    for (const key of uploadedKeys) {
      await deleteFromS3(key);
    }

    return res.status(500).json({ message: err.message });
  }
};
