const zod = require("zod");
const mongoose = require("mongoose");

exports.validateRequest = function (schema) {
	return function (req, res, next) {
		try {
			schema.parse({
				body: req.body,
				query: req.query,
				params: req.params,
			});

			next();
		} catch (err) {
			next(err);
		}
	};
};

exports.validateRequestId = function (idFieldName) {
	return function (req, res, next) {
		try {
			const schema = zod.object({
				params: zod.object({
					[idFieldName]: zod.string().superRefine((val, ctx) => {
						if (!mongoose.isValidObjectId(val)) {
							ctx.addIssue({
								code: zod.ZodIssueCode.invalid_arguments,
								message: `${val} không phải là ID hợp lệ`,
							});
						}
					}),
				}),
			});

			schema.parse({
				params: req.params,
			});

			next();
		} catch (err) {
			next(err);
		}
	};
};
