const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Hãy nhập id người dùng"],
		},
		orderDate: {
			type: Date,
			default: Date.now(),
		},
		// Statuses for order of a book store
		// 1. pending: order is created but not paid yet
		// 2. paid: order is paid
		// 3. shipping: order is shipping
		// 3. completed: order is completed
		// 4. canceled: order is canceled
		status: {
			type: String,
			enum: ["pending", "paid", "shipping", "completed", "canceled"],
			default: "pending",
		},
		description: String,
		totalPrice: {
			type: Number,
			required: [true, "Hãy nhập tổng tiền"],
		},
		finalPrice: {
			type: Number,
		},
		orderDetails: [
			{
				book: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Book",
					required: [true, "Hãy nhập id sản phẩm"],
				},
				quantity: {
					type: Number,
					required: [true, "Hãy nhập số lượng sản phẩm"],
				},
				price: {
					type: Number,
					required: [true, "Hãy nhập giá sản phẩm"],
				},
			},
		],
	},
	{
		toJSON: { virtuals: true, versionKey: false },
	}
);

orderSchema.index({ user: 1 });
orderSchema.index({ orderDate: 1 });
orderSchema.index({ "orderDetails.book": 1 });

orderSchema.pre("save", function (next) {
	if (this.isNew) {
		this.totalPrice = this.orderDetails.reduce(
			(acc, cur) => acc + cur.price * cur.quantity,
			0
		);
		this.finalPrice = this.totalPrice;
	}
});

orderSchema.plugin(mongooseLeanVirtuals);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
