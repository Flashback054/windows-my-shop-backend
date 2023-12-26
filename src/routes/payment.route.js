const express = require("express");
const paymentController = require("../controllers/payment.controller");
const vnpayController = require("../controllers/vnpay.controller");
const { validateRequestId } = require("../middlewares/validateRequest");

const router = express.Router({ mergeParams: true });

router.get("/vnpay-return", vnpayController.vnpayReturn);

router.get("/", paymentController.getAllPayments);
router.get("/:id", validateRequestId("id"), paymentController.getPayment);
router.post("/", paymentController.createPayment);
// router.get("/vnpay-ipn", vnpayController.vnpayIPN);
router.patch("/:id", validateRequestId("id"), paymentController.updatePayment);
router.delete("/:id", validateRequestId("id"), paymentController.deletePayment);

module.exports = router;
