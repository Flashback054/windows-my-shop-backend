const Payment = require("../models/payment.model");
const Order = require("../models/order.model");
const ControllerFactory = require("./controller.factory");

exports.getAllPayments = ControllerFactory.getAll(Payment, {
	allowNestedQueries: ["userId"],
});
exports.getPayment = ControllerFactory.getOne(Payment);
