const ControllerFactory = require("./controller.factory");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const CloudinaryStorageFactory = require("../configs/cloudinary.config");
const cloudinary = require("cloudinary").v2;

const User = require("../models/user.model");
const CloudinaryUserStorage = new CloudinaryStorageFactory(User);

// For admin to manage users
exports.createUser = async (req, res, next) => {
	try {
		// Check if email is already taken
		if (await User.findOne({ email: req.body.email })) {
			throw new AppError(
				400,
				"BAD_REQUEST",
				`Email ${req.body.email} đã được sử dụng.`,
				{
					email: req.body.email,
				}
			);
		}

		const newUser = await User.create(req.body);
		// Remove password and from user object
		newUser.password = undefined;

		res.status(201).json({
			data: newUser,
		});
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
};

exports.getAllUsers = ControllerFactory.getAll(User);
exports.getUser = ControllerFactory.getOne(User);
exports.updateUser = ControllerFactory.updateOne(User);
exports.deleteUser = ControllerFactory.deleteOne(User);

// ----- For customer to manage their own account -----
// For uploading user image

exports.setImagePath = (req, res, next) => {
	if (!req.file) return next();

	req.body.image = req.file.path;
	req.body.imagePublicId = req.file.filename;

	return next();
};
exports.uploadUserImage = CloudinaryUserStorage.upload.single("image");

exports.updateMe = async (req, res, next) => {
	try {
		// Check allowed fields (form data validation with zod is not working)
		const allowedFields = ["name", "phone", "image", "imagePublicId"];
		const receivedFields = Object.keys(req.body);
		const notAllowedFields = receivedFields.filter(
			(field) => !allowedFields.includes(field)
		);
		if (notAllowedFields.length > 0) {
			const metadata = {};
			notAllowedFields.forEach((field) => {
				metadata[field] = req.body[field];
			});

			throw new AppError(
				400,
				"BAD_REQUEST",
				`Không thể cập nhật trường ${notAllowedFields.join(", ")}.`,
				metadata
			);
		}

		// Update user document
		const oldUser = await User.findById(req.user.id)
			.select("+imagePublicId")
			.lean({ virtuals: true });

		const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
			new: true,
			runValidators: true,
		});

		// Delete old image
		if (
			oldUser?.image &&
			oldUser.image !== updatedUser.image &&
			!(oldUser.image.search("default") !== -1) // prevent deleting default image
		) {
			// Use cloudinary to delete old image
			try {
				await cloudinary.uploader.destroy(oldUser.imagePublicId);
			} catch (err) {
				console.log(err);
			}
		}

		res.status(200).json({
			data: updatedUser,
		});
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
};

exports.setUserId = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};
