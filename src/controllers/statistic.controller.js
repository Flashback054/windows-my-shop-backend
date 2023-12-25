const Payment = require("../models/payment.model");
const Book = require("../models/book.model");
const statisticDateConverter = require("../utils/statistic.dateConverter");

exports.importStatistic = async (req, res, next) => {
	let { type, startDate, endDate } = req.query;

	// Convert startDate, endDate to Date object
	// and type to statisticType
	const converted = statisticDateConverter(startDate, endDate, type);
	startDate = converted.startDate;
	endDate = converted.endDate;
	type = converted.type;

	const importStats = await InventoryImport.generateImportReport(
		startDate,
		endDate,
		type
	);

	// Populate inventoryItem name
	await InventoryItem.populate(importStats, {
		path: "items.inventoryItemId",
		select: "name category",
	});

	res.status(200).json({
		data: importStats,
	});
};

exports.exportStatistic = async (req, res, next) => {
	let { type, startDate, endDate } = req.query;

	// Convert startDate, endDate to Date object
	// and type to statisticType
	const converted = statisticDateConverter(startDate, endDate, type);
	startDate = converted.startDate;
	endDate = converted.endDate;
	type = converted.type;

	const exportStats = await InventoryExport.generateExportReport(
		startDate,
		endDate,
		type
	);

	await InventoryItem.populate(exportStats, {
		path: "items.inventoryItemId",
		select: "name category",
	});

	res.status(200).json({
		data: exportStats,
	});
};

exports.saleStatistic = async (req, res, next) => {
	let { type, startDate, endDate } = req.query;

	// Convert startDate, endDate to Date object
	// and type to statisticType
	const converted = statisticDateConverter(startDate, endDate, type);
	startDate = converted.startDate;
	endDate = converted.endDate;
	type = converted.type;

	const saleStats = await MenuHistory.generateSaleReport(
		startDate,
		endDate,
		type
	);

	await Book.populate(saleStats, {
		path: "items.book",
		select: "name category",
	});

	saleStats.forEach((stat) => {
		stat.items.forEach((item) => {
			if (item.book?.category === "food") {
				// For "food" items, set and calculate totalPriceLoss
				item.totalPriceLoss = item.totalPrice - item.soldPrice;
			} else {
				item.totalPriceLoss = 0;
			}
		});
	});

	res.status(200).json({
		data: saleStats,
	});
};
