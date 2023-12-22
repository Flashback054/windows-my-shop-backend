const Category = require("../models/category.model");
const ControllerFactory = require("./controller.factory");
const CloudinaryStorageFactory = require("../configs/cloudinary.config");

const CloudinaryCategoryStorage = new CloudinaryStorageFactory(Category);

exports.setImagePath = (req, res, next) => {
	if (!req.file) return next();

	req.body.image = req.file.path;
	req.body.imagePublicId = req.file.filename;

	return next();
};

exports.uploadCategoryImage = CloudinaryCategoryStorage.upload.single("image");

exports.getAllCategories = ControllerFactory.getAll(Category);
exports.getCategory = ControllerFactory.getOne(Category);
exports.createCategory = ControllerFactory.createOne(Category);
exports.updateCategory = ControllerFactory.updateOne(Category);
exports.deleteCategory = ControllerFactory.deleteOne(Category);
