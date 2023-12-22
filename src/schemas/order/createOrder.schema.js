const zod = require("zod");

const orderItemSchema = zod.object({
	bookId: zod.string({
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
	name: zod.string({
		required_error: "Tên sản phẩm là bắt buộc",
	}),
});

const createOrderSchema = zod.object({
	body: zod.array(orderItemSchema).nonempty({
		message: "Danh sách sản phẩm không được trống",
	}),
});

module.exports = createOrderSchema;
