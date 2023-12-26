const express = require("express");
const paymentController = require("../controllers/payment.controller");
const vnpayController = require("../controllers/vnpay.controller");
const { validateRequestId } = require("../middlewares/validateRequest");

const router = express.Router({ mergeParams: true });

router.get("/vnpay-return", vnpayController.vnpayReturn);

router.get("/", paymentController.getAllPayments);
router.get("/:id", validateRequestId("id"), paymentController.getPayment);
// router.get("/vnpay-ipn", vnpayController.vnpayIPN);

module.exports = router;
