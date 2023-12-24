const Book = require("../models/book.model");
const ControllerFactory = require("./controller.factory");
const CloudinaryStorageFactory = require("../configs/cloudinary.config");

const CloudinaryBookStorage = new CloudinaryStorageFactory(Book);

// Controllers for book's images upload
exports.setImagePath = (req, res, next) => {
	if (!req.file) return next();

	req.body.image = req.file.path;
	req.body.imagePublicId = req.file.filename;

	return next();
};

exports.uploadBookImage = CloudinaryBookStorage.upload.single("image");

exports.createBook = ControllerFactory.createOne(Book, {
	populate: {
		path: "categoryId",
		select: "name image",
	},
});
exports.getAllBooks = ControllerFactory.getAll(Book, {
	populate: {
		path: "categoryId",
		select: "name image",
	},
});
exports.getBook = ControllerFactory.getOne(Book, {
	populate: {
		path: "categoryId",
		select: "name image",
	},
});
exports.updateBook = ControllerFactory.updateOne(Book);
exports.deleteBook = ControllerFactory.deleteOne(Book);
