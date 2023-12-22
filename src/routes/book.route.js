const express = require("express");
const bookController = require("../controllers/book.controller");
const authController = require("../controllers/auth.controller");
const {
	validateRequest,
	validateRequestId,
} = require("../middlewares/validateRequest");

const router = express.Router();

router.get("/", bookController.getAllBooks);
router.get("/:id", validateRequestId("id"), bookController.getBook);

router.use(authController.protect, authController.restrictTo("admin"));
router.post(
	"/",
	bookController.uploadBookImage,
	bookController.setImagePath,
	bookController.createBook
);
router.patch(
	"/:id",
	validateRequestId("id"),
	bookController.uploadBookImage,
	bookController.setImagePath,
	bookController.updateBook
);
router.delete("/:id", validateRequestId("id"), bookController.deleteBook);

module.exports = router;
