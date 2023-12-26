const Order = require("../models/order.model");
const ControllerFactory = require("./controller.factory");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");
const Book = require("../models/book.model");

exports.getAllOrders = ControllerFactory.getAll(Order, {
	populate: [
		{
			path: "orderDetails.book",
			select: "name image",
		},
		{
			path: "user",
			select: "name email",
		},
	],
	allowNestedQueries: ["userId"],
});
exports.getOrder = ControllerFactory.getOne(Order, {
	populate: [
		{
			path: "orderDetails.book",
			select: "name image",
		},
		{
			path: "user",
			select: "name email",
		},
	],
});
exports.createOrder = async (req, res, next) => {
	// Get user from req.user
	const orderDetails = req.body;
	const totalPrice = orderDetails.reduce((total, item) => {
		return total + item.quantity * item.price;
	}, 0);

	const user = req.user;
	const userId = user.id;
	let order;
	// For each orderDetails, check if orderDetails.quantity <= Book.quantity
	// Use mongoose Session to rollback if any orderDetails.quantity > Book.quantity
	const session = await mongoose.startSession();
	// Substract all today
	try {
		session.startTransaction();

		for (const item of orderDetails) {
			// findOneAndUpdate() is atomic on single document
			const updatedBook = await Book.findOneAndUpdate(
				{ _id: item.book, quantity: { $gte: item.quantity } },
				{ $inc: { quantity: -item.quantity } },
				{ new: true, session }
			);

			console.log(updatedBook);

			if (!updatedBook) {
				throw new AppError(
					400,
					"NOT_ENOUGH_QUANTITY",
					`Số lượng ${item.name} không đủ để đặt hàng`,
					{
						book: `Số lượng ${item.name} không đủ để đặt hàng`,
					}
				);
			}
		}

		// Create order
		order = await Order.create({
			user: userId,
			orderDetails,
		});

		await session.commitTransaction();
		session.endSession();
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		throw error;
	}

	// Populate order.orderDetails.book and order.user
	await order.populate([
		{
			path: "orderDetails.book",
			select: "name image",
		},
		{
			path: "user",
			select: "name email",
		},
	]);

	// Send response
	res.status(201).json({
		data: order,
	});
};
exports.updateOrder = async (req, res, next) => {
	const order = await Order.findById(req.params.id);

	if (!order) {
		throw new AppError(
			404,
			"NOT_FOUND",
			`Không tìm thấy order với ID ${req.params.id}`,
			{
				id: req.params.id,
			}
		);
	}

	if (order.orderStatus === "cancelled") {
		throw new AppError(
			400,
			"BAD_REQUEST",
			"Không thể cập nhật order đã bị hủy"
		);
	}

	if (order.orderStatus === "completed") {
		throw new AppError(
			400,
			"BAD_REQUEST",
			"Không thể cập nhật order đã hoàn thành"
		);
	}

	const { orderStatus } = req.body;

	// Check if orderStatus is updated to "preparing" or "completed"
	if (orderStatus === "paid" || orderStatus === "shipping") {
		// Only admin  can update orderStatus when it is "paid" or "shipping"
		// Used to update status from "paid" -> "shipping" -> "completed"
		if (req.user.role !== "admin") {
			throw new AppError(
				403,
				"FORBIDDEN",
				"Bạn không có quyền cập nhật trạng thái hoàn thành cho đơn hàng",
				{
					orderStatus,
				}
			);
		}

		order.orderStatus = orderStatus;
		await order.save();
	}

	// Check if orderStatus is updated to "cancelled"
	if (orderStatus === "cancelled") {
		// Start a transaction
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// 2) Refund Book.quantity
			for (const item of order.orderDetails) {
				const refundedBook = await Book.findOneAndUpdate(
					{ _id: item.book },
					{ $inc: { quantity: item.quantity } },
					{ new: true, runValidators: true, session }
				);
			}

			// 4) Update paymentStatus to "cancelled"
			const payment = await Payment.findOneAndUpdate(
				{ order: order.id },
				{ paymentStatus: "failed", paymentError: "Đơn hàng đã bị huỷ" },
				{ new: true, runValidators: true, session }
			);
			// TODO: Use VNPAY to refund money to user

			await session.commitTransaction();
			session.endSession();
		} catch (error) {
			await session.abortTransaction();
			session.endSession();
			throw new AppError(
				500,
				"INTERNAL_SERVER_ERROR",
				"Có lỗi xảy ra trong quá trình huỷ đơn hàng"
			);
		}
	}

	// Populate order with orderDetails.book and user
	await order.populate({
		path: "orderDetails.book",
		select: "name image",
		options: { lean: true },
	});
	if (order.user) {
		await order.populate({
			path: "user",
			select: "name email",
			options: { lean: true },
		});
	}

	res.status(200).json({
		data: order,
	});
};
exports.deleteOrder = ControllerFactory.deleteOne(Order);

// Middleware
exports.checkOrderOwnership = async (req, res, next) => {
	if (req.user.role === "admin") {
		return next();
	}

	const order =
		req.order || (await Order.findById(req.params.id).lean({ virtuals: true }));

	if (!order) {
		throw new AppError(
			404,
			"NOT_FOUND",
			`Không tìm thấy order với ID ${req.params.id}`,
			{
				id: req.params.id,
			}
		);
	}

	if (!order.user || order.user.toString() !== req.user.id) {
		throw new AppError(
			403,
			"FORBIDDEN",
			"Bạn không có quyền truy cập vào order của người khác"
		);
	}

	req.order = order;
	next();
};

exports.checkOrderStatus = async (req, res, next) => {
	if (req.user.role === "admin") {
		return next();
	}

	const order =
		req.order || (await Order.findById(req.params.id).lean({ virtuals: true }));

	if (!order) {
		throw new AppError(
			404,
			"NOT_FOUND",
			`Không tìm thấy order với ID ${req.params.id}`,
			{
				id: req.params.id,
			}
		);
	}

	if (order.orderStatus === "completed") {
		throw new AppError(
			403,
			"FORBIDDEN",
			"Bạn không thể thay đổi order đã hoàn thành"
		);
	}

	if (order.orderStatus === "cancelled") {
		throw new AppError(403, "FORBIDDEN", "Bạn không thể thay đổi order đã hủy");
	}

	if (order.orderStatus === "shipping") {
		throw new AppError(
			403,
			"FORBIDDEN",
			"Bạn không thể thay đổi order đang giao hàng"
		);
	}

	if (order.orderStatus === "paid") {
		throw new AppError(
			403,
			"FORBIDDEN",
			"Bạn không thể thay đổi order đã thanh toán"
		);
	}

	req.order = order;
	next();
};

exports.checkGetAllOrdersPermission = async (req, res, next) => {
	if (req.user.role === "admin") {
		return next();
	}

	const userId = req.user.id;
	if (
		!req.params.userId ||
		(req.params.userId && req.params.userId !== userId)
	) {
		throw new AppError(
			403,
			"FORBIDDEN",
			"Bạn không có quyền truy cập vào order của người khác"
		);
	}

	next();
};
