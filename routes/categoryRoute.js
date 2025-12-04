const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/categoryController");
const auth = require("../middlewares/authTokenMiddleware");
const authorize = require("../middlewares/authRoleMiddleware").authorize;

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category Management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryInput:
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
 *         description:
 *           type: string
 *           example: "Kiến thức về CI/CD, Docker, Kubernetes"
 *         parent:
 *           type: string
 *           nullable: true
 *           example: "676a91f8bc7e9b1234abc999"  
 *
 *     Category:
 *       allOf:
 *         - $ref: "#/components/schemas/CategoryInput"
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "676a91f8bc7e9b1234abc123"
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Category"
 */
router.get("/", CategoryController.getCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "69315ed080ae05f46acd9d6e"
 *     responses:
 *       200:
 *         description: Category found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Category"
 *       404:
 *         description: Category not found
 */
router.get("/:id", CategoryController.getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CategoryInput"
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Category"
 *       400:
 *         description: Invalid data
 */
router.post("/", auth, authorize("admin"), CategoryController.createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "69315ed080ae05f46acd9d6e"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CategoryInput"
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 */
router.put("/:id", auth, authorize("admin"), CategoryController.updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "676a91f8bc7e9b1234abc123"
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 */
router.delete("/:id", auth, authorize("admin"), CategoryController.deleteCategory);

module.exports = router;
