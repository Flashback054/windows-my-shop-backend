const zod = require("zod");

module.exports = zod.object({
	body: zod.object({
		oldPassword: zod
			.string({
				required_error: "Phải nhập mật khẩu cũ",
			})
			.min(8, {
				message: "Mật khẩu phải có ít nhất 8 ký tự",
			}),
		newPassword: zod
			.string({
				required_error: "Phải nhập mật khẩu mới",
			})
			.min(8, {
				message: "Mật khẩu phải có ít nhất 8 ký tự",
			}),
		newPasswordConfirm: zod
			.string({
				required_error: "Phải nhập lại mật khẩu mới",
			})
			.min(8, {
				message: "Mật khẩu phải có ít nhất 8 ký tự",
			}),
	}),
});
