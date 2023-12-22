const cloudinary = require("cloudinary").v2;
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.createOne = (Model, options) => async (req, res, next) => {
	try {
		const newDoc = await Model.create(req.body);
	} catch (err) {
		// Delete uploaded image
		if (req.file) {
			try {
				await cloudinary.uploader.destroy(req.file.filename);
			} catch (err) {
				console.log(err);
			}
		}

		throw err;
	}

	if (options?.populate) {
		await newDoc.populate(options.populate);
	}

	res.status(201).json({
		data: newDoc,
	});
};

exports.getAll = (Model, options) => async (req, res, next) => {
	// // Allow nested routes
	// CURRENTLY COMMENTED OUT FOR REFACORING (add those id to query manually in route)
	if (options && options.allowNestedQueries) {
		for (const key of options.allowNestedQueries) {
			if (req.params[key]) {
				req.query[key] = req.params[key];
			}
		}
	}

	// Allow filtering by today's date
	// Loops through query string, find any key that has a value of "today"
	// and replace it with an object that specifies the range of today's date
	Object.keys(req.query).forEach((key) => {
		if (req.query[key] === "today") {
			// Filter orders by today's date
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			req.query[key] = {
				$gte: today,
				$lt: tomorrow,
			};
		}
	});

	// EXECUTE QUERY
	const features = new APIFeatures(Model.find(), req.query)
		.filter()
		.limitFields()
		.paginate()
		.sort();

	// Populate options
	if (options?.populate) {
		features.query.populate(options.populate);
	}

	// Added .lean() to improve performance
	const docs = await features.query.lean({ virtuals: true });
	const count = await Model.countDocuments(features.filterObj);

	// SEND RESPONSE
	// Set X-Total-Count header
	res.set("Access-Control-Expose-Headers", "X-Total-Count");
	res.set("X-Total-Count", count);
	res.status(200).json({
		data: docs,
	});
};

exports.getOne = (Model, options) => async (req, res, next) => {
	const query = Model.findById(req.params.id).lean({ virtuals: true });

	if (options?.populate) {
		await query.populate(options.populate);
	}

	const doc = await query;

	if (!doc) {
		throw new AppError(
			404,
			"NOT_FOUND",
			`Không tìm thấy ${Model.modelName.toLowerCase()} với ID ${req.params.id}`,
			{
				id: req.params.id,
				modelName: Model.modelName.toLowerCase(),
			}
		);
	}

	res.status(200).json({
		data: doc,
	});
};

exports.updateOne = (Model, options) => async (req, res, next) => {
	const oldDoc = await Model.findById(req.params.id).lean({ virtuals: true });

	const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!updatedDoc) {
		throw new AppError(
			404,
			"NOT_FOUND",
			`Không tìm thấy ${Model.modelName.toLowerCase()} với ID ${req.params.id}`,
			{
				id: req.params.id,
				modelName: Model.modelName.toLowerCase(),
			}
		);
	}

	if (
		oldDoc &&
		oldDoc.image &&
		oldDoc.image !== updatedDoc.image &&
		!(oldDoc.image.search("default") !== -1) // prevent deleting default image
	) {
		// Use cloudinary to delete old image
		await cloudinary.uploader.destroy(oldDoc.imagePublicId);
	}

	if (options?.populate) {
		await updatedDoc.populate(options.populate);
	}

	res.status(200).json({
		data: updatedDoc,
	});
};

exports.deleteOne = (Model) => async (req, res, next) => {
	const doc = await Model.findOneAndDelete({ _id: req.params.id });

	if (!doc) {
		throw new AppError(
			404,
			"NOT_FOUND",
			`Không tìm thấy ${Model.modelName.toLowerCase()} với ID ${req.params.id}`,
			{
				id: req.params.id,
				modelName: Model.modelName.toLowerCase(),
			}
		);
	}

	if (
		doc.image &&
		!(doc.image.search("default") !== -1) // prevent deleting default image
	) {
		// Use cloudinary to delete old image
		try {
			await cloudinary.uploader.destroy(doc.imagePublicId);
		} catch (err) {
			console.log(err);
		}
	}

	res.status(204).json({
		data: null,
	});
};
