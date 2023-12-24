const Payment = require("../models/payment.model");
const Order = require("../models/order.model");
const ControllerFactory = require("./controller.factory");

exports.getAllPayments = ControllerFactory.getAll(Payment, {
	allowNestedQueries: ["userId"],
	populate: {
		path: "orderId",
		populate: {
			path: "userId",
			select: "name email",
		},
	},
});
exports.getPayment = ControllerFactory.getOne(Payment, {
	populate: {
		path: "orderId",
		populate: {
			path: "userId",
			select: "name email",
		},
	},
});
