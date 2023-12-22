module.exports = function (startDate, endDate, type) {
	switch (type) {
		case "today":
			type = "day";
			startDate = new Date();
			endDate = new Date();

			startDate.setHours(0, 0, 0, 0);
			endDate.setHours(23, 59, 59, 999);
			break;

		case "dateRange":
			type = "day";
			startDate = new Date(startDate);
			endDate = new Date(endDate);

			startDate.setHours(0, 0, 0, 0);
			endDate.setHours(23, 59, 59, 999);
			break;

		case "month":
			startDate = new Date();
			endDate = new Date();

			startDate.setDate(1);
			startDate.setHours(0, 0, 0, 0);
			endDate.setHours(23, 59, 59, 999);
			break;

		case "year":
			startDate = new Date();
			endDate = new Date();

			startDate.setMonth(0, 1);
			startDate.setHours(0, 0, 0, 0);
			endDate.setMonth(11, 31);
			endDate.setHours(23, 59, 59, 999);
			break;
	}

	return { startDate, endDate, type };
};
