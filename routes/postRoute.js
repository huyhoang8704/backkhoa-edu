const express = require("express");
const router = express.Router();

const PostController = require("../controllers/postController");
const auth = require("../middlewares/authTokenMiddleware");
const authorize = require("../middlewares/authRoleMiddleware").authorize;
const upload = require("../middlewares/uploadPost");

// ================= Swagger Docs =================

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post Management (Blog / Article / Page)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PostInput:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - status
 *       properties:
 *         title:
 *           type: string
 *           example: "Giới thiệu CI/CD Pipeline"
 *         summary:
 *           type: string
 *           example: "Tổng quan về quy trình CI/CD trong DevOps"
 *         content:
 *           type: string
 *           example: "<p>Bài viết mô tả quy trình CI/CD...</p>"
 *         type:
 *           type: string
 *           enum: [post, page, article, news, video]
 *           example: "post"
 *         status:
 *           type: string
 *           enum: [draft, published, scheduled]
 *           example: "published"
 *         category:
 *           type: string
 *           example: "69315ed080ae05f46acd9d6e"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["6931604f61ee4fa5b15891ed", "6931605761ee4fa5b15891f1"]
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         seo:
 *           type: object
 *           properties:
 *             metaTitle:
 *               type: string
 *               example: "SEO Title"
 *             metaDescription:
 *               type: string
 *               example: "SEO Description"
 *             keywords:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["devops", "cicd"]
 *
 *   requestBodies:
 *     CreatePostFormData:
 *       description: Tạo bài viết với thumbnail + nhiều files
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               title:
 *                 type: string
 *                 example: "Bài viết test"
 *               summary:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [post, page, article, news, video]
 *                 example: "post"
 *               status:
 *                 type: string
 *                 enum: [draft, published, scheduled]
 *                 example: "draft"
 *               category:
 *                 type: string
 *               tags:
 *                 type: string
 *                 example: '["id1","id2"]'
 *               seo:
 *                 type: string
 *                 example: '{"metaTitle":"test","metaDescription":"abc"}'
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: "#/components/requestBodies/CreatePostFormData"
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Bad request (invalid body or slug existed)
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  auth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "files", maxCount: 10 },
  ]),
  PostController.createPost
);

module.exports = router;
