const express = require("express");
const authController = require("../controllers/auth.controller");
const couponController = require("../controllers/coupon.controller");
const { validateRequestId } = require("../middlewares/validateRequest");

const router = express.Router();

router.get("/:id", validateRequestId("id"), couponController.getCoupon);

router.use(authController.protect, authController.restrictTo("admin"));

router.get("/", couponController.getAllCoupons);
router.post("/", couponController.createCoupon);
router
	.route("/:id")
	.all(validateRequestId("id"))
	.patch(couponController.updateCoupon)
	.delete(couponController.deleteCoupon);

module.exports = router;
