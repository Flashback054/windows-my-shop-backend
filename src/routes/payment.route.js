const express = require("express");
const paymentController = require("../controllers/payment.controller");
const { validateRequestId } = require("../middlewares/validateRequest");

const router = express.Router({ mergeParams: true });

router.get("/", paymentController.getAllPayments);
router.get("/:id", validateRequestId("id"), paymentController.getPayment);

module.exports = router;
