const Payment = require("../models/payment.model");
const ControllerFactory = require("./controller.factory");

exports.getAllPayments = ControllerFactory.getAll(Payment, {
	allowNestedQueries: ["userId"],
	populate: {
		path: "order",
		populate: {
			path: "user",
			select: "name email",
		},
	},
});
exports.getPayment = ControllerFactory.getOne(Payment, {
	populate: {
		path: "order",
		populate: {
			path: "user",
			select: "name email",
		},
	},
});
exports.createPayment = ControllerFactory.createOne(Payment);
exports.updatePayment = ControllerFactory.updateOne(Payment);
exports.deletePayment = ControllerFactory.deleteOne(Payment);
