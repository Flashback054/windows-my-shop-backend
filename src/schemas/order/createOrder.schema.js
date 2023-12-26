const zod = require("zod");

const orderItemSchema = zod.object({
	book: zod.string({
		required_error: "Mã sản phẩm là bắt buộc",
	}),
	quantity: zod
		.number({
			required_error: "Số lượng sản phẩm là bắt buộc",
		})
		.int({
			message: "Số lượng sản phẩm phải là số nguyên dương",
		})
		.positive({
			required_error: "Số lượng sản phẩm phải là số nguyên dương",
		}),
	price: zod
		.number({
			required_error: "Giá sản phẩm là bắt buộc",
		})
		.positive({
			required_error: "Giá sản phẩm phải là số dương",
		}),
});

const createOrderSchema = zod.object({
	body: zod.object({
		user: zod.string().optional(),
		orderDetails: zod.array(orderItemSchema).min(1, {
			message: "Order phải có ít nhất 1 sản phẩm",
		}),
	}),
});

module.exports = createOrderSchema;
