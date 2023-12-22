const Coupon = require("../models/coupon.model");
const ControllerFactory = require("./controller.factory");

exports.getAllCoupons = ControllerFactory.getAll(Coupon);
exports.getCoupon = ControllerFactory.getOne(Coupon);
exports.createCoupon = ControllerFactory.createOne(Coupon);
exports.updateCoupon = ControllerFactory.updateOne(Coupon);
exports.deleteCoupon = ControllerFactory.deleteOne(Coupon);
