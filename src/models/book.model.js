const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const bookSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Hãy nhập tên sản phẩm"],
			unique: true,
		},
		image: {
			type: String,
		},
		imagePublicId: {
			type: String,
		},
		purchasePrice: {
			type: Number,
			required: [true, "Hãy nhập giá nhập sản phẩm"],
		},
		sellingPrice: {
			type: Number,
			required: [true, "Hãy nhập giá bán sản phẩm"],
		},
		author: {
			type: String,
			required: [true, "Hãy nhập tên tác giả"],
		},
		publishedYear: {
			type: Number,
			required: [true, "Hãy nhập năm xuất bản"],
			min: [0, "Năm xuất bản không hợp lệ"],
			validate: {
				validator: function (year) {
					return Number.isInteger(year);
				},
				message: "Năm xuất bản không hợp lệ",
			},
		},
		ratingsAverage: {
			type: Number,
			default: 5,
		},
		quantity: {
			type: Number,
			required: [true, "Hãy nhập số lượng sản phẩm"],
		},
		description: String,
		categoryId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: [true, "Hãy nhập id danh mục"],
		},
	},
	{
		toJSON: { virtuals: true, versionKey: false },
	}
);

bookSchema.index({ name: 1 }, { unique: true });
bookSchema.plugin(mongooseLeanVirtuals);

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
