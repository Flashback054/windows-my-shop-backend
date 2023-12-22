const express = require("express");
const orderController = require("../controllers/order.controller");
const authController = require("../controllers/auth.controller");
const {
	validateRequest,
	validateRequestId,
} = require("../middlewares/validateRequest");
const createOrderSchema = require("../schemas/order/createOrder.schema");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get("/", orderController.getAllOrders);
router.post(
	"/",
	validateRequest(createOrderSchema),
	orderController.createOrder
);

router
	.route("/:id")
	.all(validateRequestId("id"), orderController.checkOrderOwnership)
	.get(orderController.getOrder)
	.patch(orderController.updateOrder)
	.delete(orderController.deleteOrder);

module.exports = router;
