const express = require("express");
const reviewController = require("../controllers/review.controller");
const authController = require("../controllers/auth.controller");
const {
	validateRequest,
	validateRequestId,
} = require("../middlewares/validateRequest");
const createReviewSchema = require("../schemas/review/createReview.schema");

const router = express.Router({ mergeParams: true });

router.get("/", reviewController.getAllReviews);
router.get("/:id", validateRequestId("id"), reviewController.getReview);

router.use(authController.protect);

router.post(
	"/",
	reviewController.setBookAndUserOnBody,
	validateRequest(createReviewSchema),
	reviewController.catchReview(reviewController.createReview)
);
router.patch(
	"/:id",
	validateRequestId("id"),
	reviewController.checkReviewBelongsToUser,
	reviewController.catchReview(reviewController.updateReview)
);
router.delete(
	"/:id",
	validateRequestId("id"),
	reviewController.checkReviewBelongsToUser,
	reviewController.deleteReview
);

module.exports = router;
