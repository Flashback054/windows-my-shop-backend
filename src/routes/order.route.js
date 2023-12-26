const express = require("express");
const orderController = require("../controllers/order.controller");
const authController = require("../controllers/auth.controller");
const vnpayController = require("../controllers/vnpay.controller");
const {
	validateRequest,
	validateRequestId,
} = require("../middlewares/validateRequest");
const createOrderSchema = require("../schemas/order/createOrder.schema");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.param("id", validateRequestId("id"));
router.param("userId", validateRequestId("userId"));

router.get(
	"/",
	orderController.checkGetAllOrdersPermission,
	orderController.getAllOrders
);
router.post(
	"/",
	validateRequest(createOrderSchema),
	orderController.createOrder
);

router.get(
	"/:id",
	orderController.checkOrderOwnership,
	orderController.getOrder
);

router
	.route("/:id")
	.all(orderController.checkOrderOwnership, orderController.checkOrderStatus)
	.patch(orderController.updateOrder)
	.delete(orderController.deleteOrder);

// A route to pay for an order
router.post(
	"/:id/pay",
	orderController.checkOrderOwnership,
	orderController.checkOrderStatus,
	vnpayController.createVNPAYPayment
);

module.exports = router;
