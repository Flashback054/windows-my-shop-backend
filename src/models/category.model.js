const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const categorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Hãy nhập tên danh mục"],
		unique: true,
	},
	description: String,
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});

categorySchema.plugin(mongooseLeanVirtuals);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
