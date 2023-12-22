const zod = require("zod");
const mongoose = require("mongoose");
const { fromZodError } = require("zod-validation-error");
const convertToReadableMetadata = require("../utils/convertToReadableMetadata");
const AppError = require("../utils/appError");

module.exports = (err, req, res, next) => {
	// Check if erro is zod's error
	if (err instanceof zod.ZodError) {
		const validationErrors = fromZodError(err, {
			prefix: "Lỗi dữ liệu",
			includePath: false,
			unionSeparator: ", hoặc",
		});

		return res.status(400).json({
			error: {
				errorMessage: validationErrors.message,
				errorCode: "INVALID_ARGUMENTS",
				errorFields: convertToReadableMetadata(validationErrors.details),
			},
		});
	}

	// Check if error is Mongoose ValidationError
	if (err instanceof mongoose.Error.ValidationError) {
		const validationErrorMessages = Object.values(err.errors).map(
			(error) => error.message
		);

		return res.status(400).json({
			error: {
				errorMessage: validationErrorMessages.join("; "),
				errorCode: "INVALID_ARGUMENTS",
				errorFields: err.errors,
			},
		});
	} else if (err instanceof mongoose.Error.CastError) {
		// Check if error is Mongoose CastError
		return res.status(400).json({
			error: {
				errorMessage: `Không thể chuyển đổi ${err.value} thành ${err.kind}}`,
				errorCode: "CAST_ERROR",
				errorFields: {
					[err.path]: {
						value: err.value,
						kind: err.kind,
						message: `Không thể chuyển đổi ${err.value} thành ${err.kind}}`,
					},
				},
			},
		});
	} else if (err.code === 11000) {
		// Duplicate key error
		const keys = Object.keys(err.keyValue);
		const values = Object.values(err.keyValue);
		const errorMessage = `Trường (${keys.join(", ")}) (${values.join(
			", "
		)}) đã tồn tại`;

		return res.status(400).json({
			error: {
				errorMessage: errorMessage,
				errorCode: "DUPLICATE_KEY",
				errorFields: err.keyValue,
			},
		});
	}

	// Check if error is AppError (custom error)
	if (err.isOperational) {
		return res.status(err.statusCode || 500).json({
			message: err.message,
			reasonPhrase: err.reasonPhrase,
			metadata: err.metadata,
		});
	}

	console.log(err);
	return res.status(500).json({
		message: "Có lỗi xảy ra. Xin hãy liên hệ với admin.",
		reasonPhrase: "INTERNAL_SERVER_ERROR",
	});
};
