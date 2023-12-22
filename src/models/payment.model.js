const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const paymentSchema = new mongoose.Schema(
	{
		orderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			required: [true, "Hãy nhập id đơn hàng"],
		},
		couponId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Coupon",
		},

		status: {
			type: String,
			enum: ["pending", "success", "failed"],
			default: "pending",
		},
		paymentDate: {
			type: Date,
			default: Date.now(),
		},
		description: String,
		totalPrice: {
			type: Number,
			required: [true, "Hãy nhập tổng tiền"],
		},
		discountPrice: {
			type: Number,
			default: 0,
		},
		finalPrice: {
			type: Number,
		},
	},
	{
		toJSON: { virtuals: true, versionKey: false },
	}
);

paymentSchema.index({ orderId: 1 });
paymentSchema.plugin(mongooseLeanVirtuals);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
