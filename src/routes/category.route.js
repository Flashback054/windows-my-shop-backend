const express = require("express");
const authController = require("../controllers/auth.controller");
const categoryController = require("../controllers/category.controller");
const { validateRequestId } = require("../middlewares/validateRequest");

const router = express.Router();

router.use(authController.protect, authController.restrictTo("admin"));

router.get("/", categoryController.getAllCategories);
router.post(
	"/",
	categoryController.uploadCategoryImage,
	categoryController.setImagePath,
	categoryController.createCategory
);

router
	.route("/:id")
	.all(validateRequestId("id"))
	.get(categoryController.getCategory)
	.patch(
		categoryController.uploadCategoryImage,
		categoryController.setImagePath,
		categoryController.updateCategory
	)
	.delete(categoryController.deleteCategory);

module.exports = router;
