const express = require("express");
const authController = require("../controllers/auth.controller");
const categoryController = require("../controllers/category.controller");
const { validateRequestId } = require("../middlewares/validateRequest");

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.post(
	"/",
	categoryController.uploadCategoryImage,
	categoryController.setImagePath,
	categoryController.createCategory
);

router.get("/:id", validateRequestId("id"), categoryController.getCategory);
router
	.route("/:id")
	.all(
		authController.protect,
		authController.restrictTo("admin"),
		validateRequestId("id")
	)
	.patch(
		categoryController.uploadCategoryImage,
		categoryController.setImagePath,
		categoryController.updateCategory
	)
	.delete(categoryController.deleteCategory);

module.exports = router;
