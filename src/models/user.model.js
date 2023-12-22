const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Hãy nhập tên của bạn"],
		},
		email: {
			type: String,
			required: [true, "Hãy nhập email của bạn"],
			unique: true,
			validate: [isEmail, "Email không hợp lệ"],
		},
		password: {
			type: String,
			required: [true, "Hãy nhập mật khẩu của bạn"],
			minlength: [8, "Mật khẩu phải có ít nhất 8 ký tự"],
			select: false,
		},
		role: {
			type: String,
			enum: ["admin", "customer"],
			default: "customer",
		},
		image: {
			type: String,
			default:
				"https://res.cloudinary.com/dnvgbbddv/image/upload/v1703240642/windows-my-shop/User/default.jpg",
		},
		imagePublicId: {
			type: String,
			default: "windows-my-shop/User/default.jpg",
		},
		phone: {
			type: String,
			validate: {
				validator: function (phone) {
					const regex = /^\d{10}$/;
					return regex.test(phone);
				},
				message: "Số điện thoại phải có 10 chữ số",
			},
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		passwordUpdatedAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
	},
	{
		toJSON: { virtuals: true, versionKey: false },
	}
);

userSchema.index({ email: 1 });

////////// MIDDLEWARE ///////

// Decrypt password
userSchema.pre("save", async function (next) {
	// only run this function if Password is modified
	if (!this.isModified("password")) return next();

	// 12 : how CPU intensive to hash password
	this.password = await bcrypt.hash(this.password, 12);

	next();
});

// Update passwordUpdatedAt
userSchema.pre("save", function (next) {
	if (!this.isModified("password") || this.isNew) return next();

	// A little hack: minus 1 seconds : b/c this save process might finish after JWT being created -> error
	this.passwordUpdatedAt = Date.now() - 1000;
	next();
});

userSchema.pre(
	["updateOne", "findByIdAndUpdate", "findOneAndUpdate"],
	async function (next) {
		const data = this.getUpdate();
		if (data.password) {
			data.password = await bcrypt.hash(data.password, 12);
			data.passwordUpdatedAt = Date.now() - 1000;
		}
		next();
	}
);

////////// METHODS //////////
userSchema.methods.isCorrectPassword = async function (inputPassword) {
	return await bcrypt.compare(inputPassword, this.password);
};

userSchema.methods.updatePassword = async function (newPassword) {
	this.password = newPassword;
	await this.save();
};

// Check if the password is changed after the token was issued
userSchema.methods.isChangedPasswordAfter = function (JWTTimestamp) {
	// Password has been changed after user being created
	if (this.passwordUpdatedAt) {
		const passwordChangeTime = parseInt(
			this.passwordUpdatedAt.getTime() / 1000,
			10
		);
		return JWTTimestamp < passwordChangeTime;
	}

	// False: token was issued before password change time
	return false;
};

userSchema.plugin(mongooseLeanVirtuals);

const User = mongoose.model("User", userSchema);

module.exports = User;
