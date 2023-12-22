const zod = require("zod");

module.exports = zod.object({
	body: zod.object({
		email: zod
			.string({
				required_error: "Phải nhập email",
			})
			.email({
				message: "Email không hợp lệ",
			}),
		password: zod
			.string({
				required_error: "Phải nhập mật khẩu",
			})
			.min(8, {
				message: "Mật khẩu phải có ít nhất 8 ký tự",
			})
			.max(100, {
				message: "Mật khẩu không được quá 100 ký tự",
			}),
	}),
});
