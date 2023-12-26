const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const AppError = require("../utils/appError");
const statisticAddMissingDates = require("../utils/statistic.addMissingDates");
const statisticAddMissingBooks = require("../utils/statistic.addMissingBooks");

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Hãy nhập id người dùng"],
		},
		orderDate: {
			type: Date,
			default: Date.now(),
		},
		// Statuses for order of a book store
		// 1. pending: order is being paid
		// 2. paid: order is paid
		// 3. shipping: order is shipping
		// 3. completed: order is completed
		// 4. canceled: order is canceled
		status: {
			type: String,
			enum: ["pending", "paid", "shipping", "completed", "cancelled"],
			default: "pending",
		},
		description: String,
		totalPrice: {
			type: Number,
		},
		finalPrice: {
			type: Number,
		},
		orderDetails: [
			{
				book: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Book",
					required: [true, "Hãy nhập id sản phẩm"],
				},
				quantity: {
					type: Number,
					required: [true, "Hãy nhập số lượng sản phẩm"],
				},
				price: {
					type: Number,
					required: [true, "Hãy nhập giá sản phẩm"],
				},
			},
		],
	},
	{
		toJSON: { virtuals: true, versionKey: false },
	}
);

orderSchema.index({ user: 1 });
orderSchema.index({ orderDate: 1 });

orderSchema.pre("save", function (next) {
	if (this.isNew || this.isModified("orderDetails")) {
		this.totalPrice = this.orderDetails.reduce(
			(acc, cur) => acc + cur.price * cur.quantity,
			0
		);
		this.finalPrice = this.totalPrice;
	}

	next();
});

orderSchema.statics.countNewOrders = async function (type) {
	let startDate, endDate;
	switch (type) {
		case "week":
			startDate = new Date();
			startDate.setDate(startDate.getDate() - 7);
			endDate = new Date();
			break;
		case "month":
			startDate = new Date();
			startDate.setDate(startDate.getDate() - 30);
			endDate = new Date();
			break;

		default:
			throw new AppError(
				400,
				"INVALID_ARGUMENTS",
				`Không hỗ trợ thống kê theo kiểu ${type}`,
				{
					type: `Không hỗ trợ thống kê theo kiểu ${type}`,
				}
			);
	}

	return this.countDocuments({
		orderDate: {
			$gte: startDate,
			$lt: endDate,
		},
		$and: [{ status: { $ne: "cancelled" } }, { status: { $ne: "pending" } }],
	});
};

orderSchema.statics.revenueAndProfitStatistics = async function (
	type,
	startDate,
	endDate
) {
	let groupByDateType;
	if (type !== "year") {
		groupByDateType = {
			$dateToString: {
				format: "%Y-%m-%d",
				date: "$orderDate",
			},
		};
	} else {
		groupByDateType = {
			$dateToString: {
				format: "%Y-%m",
				date: "$orderDate",
			},
		};
	}
	switch (type) {
		case "today":
			startDate = new Date();
			startDate.setHours(0, 0, 0, 0);
			endDate = new Date();
			endDate.setHours(23, 59, 59, 999);
			break;
		case "dateRange":
			startDate = new Date(startDate);
			endDate = new Date(endDate);
			break;
		case "week":
			startDate = new Date();
			startDate.setDate(startDate.getDate() - 7);
			endDate = new Date();
			break;
		case "month":
			startDate = new Date();
			startDate.setDate(startDate.getDate() - 30);
			endDate = new Date();
			break;

		case "year":
			startDate = new Date();
			startDate.setMonth(startDate.getMonth() - 12);
			endDate = new Date();
			break;
	}

	const stats = await this.aggregate([
		{
			$match: {
				orderDate: {
					$gte: startDate,
					$lt: endDate,
				},
				$and: [
					{ status: { $ne: "cancelled" } },
					{ status: { $ne: "pending" } },
				],
			},
		},
		{
			$lookup: {
				from: "books",
				localField: "orderDetails.book",
				foreignField: "_id",
				as: "books",
			},
		},
		{
			$addFields: {
				date: groupByDateType,
				totalPurchasePrice: {
					$sum: "$books.purchasePrice",
				},
			},
		},
		{
			$group: {
				_id: "$date",
				revenue: {
					$sum: "$finalPrice",
				},
				profit: {
					$sum: {
						$subtract: ["$finalPrice", "$totalPurchasePrice"],
					},
				},
			},
		},
		{
			$project: {
				_id: 0,
				date: "$_id",
				revenue: 1,
				profit: 1,
			},
		},
		{
			$sort: { date: 1 },
		},
	]);

	let statsResult = statisticAddMissingDates(stats, startDate, endDate, [
		"revenue",
		"profit",
	]);

	return statsResult;
};

orderSchema.statics.bookSaleStatistics = async function (
	type,
	startDate,
	endDate
) {
	switch (type) {
		case "today":
			startDate = new Date();
			startDate.setHours(0, 0, 0, 0);
			endDate = new Date();
			endDate.setHours(23, 59, 59, 999);
			break;
		case "dateRange":
			startDate = new Date(startDate);
			endDate = new Date(endDate);
			break;
		case "week":
			startDate = new Date();
			startDate.setDate(startDate.getDate() - 7);
			endDate = new Date();
			break;
		case "month":
			startDate = new Date();
			startDate.setDate(startDate.getDate() - 30);
			endDate = new Date();
			break;

		case "year":
			startDate = new Date();
			startDate.setMonth(startDate.getMonth() - 12);
			endDate = new Date();
			break;
	}

	const stats = await this.aggregate([
		{
			$match: {
				orderDate: {
					$gte: startDate,
					$lt: endDate,
				},
				$and: [
					{ status: { $ne: "cancelled" } },
					{ status: { $ne: "pending" } },
				],
			},
		},
		{
			$unwind: "$orderDetails",
		},
		{
			$group: {
				_id: "$orderDetails.book",
				soldQuantity: {
					$sum: "$orderDetails.quantity",
				},
			},
		},
		{
			$lookup: {
				from: "books",
				localField: "_id",
				foreignField: "_id",
				as: "book",
			},
		},
		{
			$unwind: "$book",
		},
		{
			$project: {
				_id: 0,
				id: "$book._id",
				name: "$book.name",
				image: "$book.image",
				soldQuantity: "$soldQuantity",
			},
		},
		{
			$sort: {
				quantity: -1,
			},
		},
	]);

	const statsResult = await statisticAddMissingBooks(
		stats,
		startDate,
		endDate,
		["soldQuantity"]
	);

	return stats;
};

orderSchema.plugin(mongooseLeanVirtuals);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
