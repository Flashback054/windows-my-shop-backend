const Review = require("../models/review.model");
const ControllerFactory = require("./controller.factory");
const AppError = require("../utils/appError");

exports.getAllReviews = ControllerFactory.getAll(Review, {
	populate: [
		{
			path: "user",
			select: "name email",
		},
		{
			path: "book",
			select: "name",
		},
	],
	allowNestedQueries: ["userId"],
});

exports.getReview = ControllerFactory.getOne(Review, {
	populate: [
		{
			path: "user",
			select: "name email",
		},
		{
			path: "book",
			select: "name",
		},
	],
});

exports.createReview = ControllerFactory.createOne(Review, {
	populate: [
		{
			path: "user",
			select: "name email",
		},
		{
			path: "book",
			select: "name",
		},
	],
});

exports.updateReview = ControllerFactory.updateOne(Review, {
	populate: [
		{
			path: "user",
			select: "name email",
		},
		{
			path: "book",
			select: "name",
		},
	],
});

exports.deleteReview = ControllerFactory.deleteOne(Review);

exports.setBookAndUserOnBody = (req, res, next) => {
	if (!req.body.book) req.body.book = req.params?.book;
	if (!req.body.user) req.body.user = req.user?.id;
	next();
};

exports.checkReviewBelongsToUser = async (req, res, next) => {
	if (req.user?.role === "admin") return next();

	const review = await Review.findById(req.params.id).lean({ virtuals: true });

	if (!review) {
		throw new AppError(
			404,
			"NOT_FOUND",
			`Không tìm thấy review với ID ${req.params.id}`,
			{
				id: req.params.id,
			}
		);
	}

	if (review.user.toString() !== req.user.id.toString()) {
		throw new AppError(
			403,
			"FORBIDDEN",
			"Bạn không được sửa, xoá đánh giá của người khác",
			{
				id: req.params.id,
			}
		);
	}

	next();
};

exports.catchReview = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch((error) => {
			if (error.code === 11000) {
				error = new AppError(
					400,
					"BAD_REQUEST",
					"Bạn đã đánh giá sách này rồi"
				);
			}

			next(error);
		});
	};
};
