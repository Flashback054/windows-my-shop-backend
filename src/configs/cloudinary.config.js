const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

class CloudinaryStorageFactory {
	constructor(model) {
		this.cloudinaryStorage = new CloudinaryStorage({
			cloudinary,
			params: {
				folder: `windows-my-shop/${model.modelName}`,
				allowed_formats: ["jpg", "png"],
				format: "jpg",
				transformation: [{ width: 900, crop: "fill" }],
				tags: [model.modelName],
			},
		});

		this.upload = multer({ storage: this.cloudinaryStorage });
	}
}

module.exports = CloudinaryStorageFactory;
