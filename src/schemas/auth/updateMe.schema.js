const zod = require("zod");

const updateMeSchema = zod.object({
	body: {
		name: zod.string().optional(),
		phone: zod
			.string()
			.min(10, {
				message: "Số điện thoại phải có 10 chữ số.",
			})
			.max(10, {
				message: "Số điện thoại phải có 10 chữ số.",
			})
			.optional(),
		image: zod.optional(),
	},
});
