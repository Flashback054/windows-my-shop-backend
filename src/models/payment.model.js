const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const paymentSchema = new mongoose.Schema(
	{
		order: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			required: [true, "Hãy nhập id đơn hàng"],
		},
		coupon: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Coupon",
		},
		status: {
			type: String,
			enum: ["pending", "success", "failed"],
			default: "pending",
		},
		paymentError: String,
		paymentDate: {
			type: Date,
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

paymentSchema.index({ order: 1 });
paymentSchema.plugin(mongooseLeanVirtuals);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
