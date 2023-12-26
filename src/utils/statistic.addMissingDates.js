module.exports = function (statisticResult, startDate, endDate, keys) {
	if (statisticResult.length === 0) return statisticResult;

	let type = statisticResult[0].date.length === 10 ? "day" : "month";

	if (statisticResult)
		if (type === "day") {
			const includedDates = new Set();

			for (const statistic of statisticResult) {
				includedDates.add(statistic.date);
			}

			let currentDate = new Date(startDate);

			while (currentDate <= endDate) {
				const date = currentDate.toISOString().slice(0, 10);

				if (!includedDates.has(date)) {
					const missingDate = { date };

					for (const key of keys) {
						missingDate[key] = 0;
					}

					statisticResult.push(missingDate);
				}

				currentDate.setDate(currentDate.getDate() + 1);
			}
		} else if (type === "month") {
			const includedDates = new Set();

			for (const statistic of statisticResult) {
				includedDates.add(statistic.date);
			}

			let currentDate = new Date(startDate);

			while (currentDate <= endDate) {
				const date = currentDate.toISOString().slice(0, 7);

				if (!includedDates.has(date)) {
					const missingDate = { date };

					for (const key of keys) {
						missingDate[key] = 0;
					}

					statisticResult.push(missingDate);
				}

				currentDate.setMonth(currentDate.getMonth() + 1);
			}
		}

	return statisticResult.sort((a, b) => {
		if (a.date > b.date) return 1;
		if (a.date < b.date) return -1;
		return 0;
	});
};
