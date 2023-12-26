const Order = require("../models/order.model");
const Book = require("../models/book.model");

exports.countSellingBooks = async (req, res, next) => {
	const countBooks = await Book.countDocuments({
		quantity: { $gt: 0 },
	});

	res.status(200).json({
		data: countBooks,
	});
};

exports.countNewOrders = async (req, res, next) => {
	const { type } = req.query;

	const countNewOrders = await Order.countNewOrders(type);

	res.status(200).json({
		data: countNewOrders,
	});
};

// Top 5 low stock books
exports.getTop5LowStockBooks = async (req, res, next) => {
	const top5LowStockBooks = await Book.find({ quantity: { $lt: 5 } })
		.sort({ quantity: 1 })
		.limit(5);

	res.status(200).json({
		data: top5LowStockBooks,
	});
};

exports.getRevenueAndProfitStats = async (req, res, next) => {
	const { type, startDate, endDate } = req.query;

	const revenueAndProfitStats = await Order.revenueAndProfitStatistics(
		type,
		startDate,
		endDate
	);

	res.status(200).json({
		data: revenueAndProfitStats,
	});
};

exports.getBookSaleStats = async (req, res, next) => {
	const { type, startDate, endDate } = req.query;

	const bookSaleStats = await Order.bookSaleStatistics(
		type,
		startDate,
		endDate
	);

	res.status(200).json({
		data: bookSaleStats,
	});
};
