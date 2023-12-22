class AppError extends Error {
	constructor(statusCode, errorCode, errorMessage, errorFields) {
		super(errorMessage);
		this.statusCode = statusCode;
		this.errorCode = errorCode;
		this.errorFields = errorFields;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = AppError;
