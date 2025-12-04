const express = require("express");
const router = express.Router();
const TagController = require("../controllers/tagController");
const auth = require("../middlewares/authTokenMiddleware");
const authorize = require("../middlewares/authRoleMiddleware").authorize;

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Tag Management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TagInput:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *       properties:
 *         name:
 *           type: string
 *           example: "DevOps"
 *         slug:
 *           type: string
 *           example: "devops"
 *
 *     Tag:
 *       allOf:
 *         - $ref: "#/components/schemas/TagInput"
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "676a91f8bc7e9b1234abc999"
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of all tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Tag"
 */
router.get("/", TagController.getTags);

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     summary: Get tag by ID
 *     tags: [Tags]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "676a91f8bc7e9b1234abc999"
 *     responses:
 *       200:
 *         description: Tag found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Tag"
 *       404:
 *         description: Tag not found
 */
router.get("/:id", TagController.getTagById);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create new tag (Admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/TagInput"
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       400:
 *         description: Invalid input or slug already exists
 */
router.post("/", auth, authorize("admin"), TagController.createTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: Update tag (Admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *           example: "676a91f8bc7e9b1234abc999"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/TagInput"
 *     responses:
 *       200:
 *         description: Tag updated
 *       404:
 *         description: Tag not found
 */
router.put("/:id", auth, authorize("admin"), TagController.updateTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete tag (Admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         required: true
 *         in: path
 *         schema:
 *           type: string
 *           example: "676a91f8bc7e9b1234abc999"
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       404:
 *         description: Tag not found
 */
router.delete("/:id", auth, authorize("admin"), TagController.deleteTag);

module.exports = router;
