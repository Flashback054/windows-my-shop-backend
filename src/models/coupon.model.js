const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const couponSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: [true, "Hãy nhập mã giảm giá"],
			unique: true,
		},
		name: {
			type: String,
			required: [true, "Hãy nhập tên giảm giá"],
		},
		description: String,
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		startDate: {
			type: Date,
			required: [true, "Hãy nhập ngày bắt đầu"],
		},
		endDate: Date,
		discount_percent: {
			type: Number,
			required: [true, "Hãy nhập phần trăm giảm giá"],
		},
		maxDiscount: {
			type: Number,
			required: [true, "Hãy nhập số tiền giảm tối đa"],
		},
		minPrice: {
			type: Number,
			required: [true, "Hãy nhập số tiền tối thiểu"],
		},
	},
	{
		toJSON: { virtuals: true, versionKey: false },
	}
);

couponSchema.index({ code: 1 });

couponSchema.plugin(mongooseLeanVirtuals);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
