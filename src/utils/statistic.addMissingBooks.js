const Book = require("../models/book.model");

module.exports = async function (statisticResult, startDate, endDate, keys) {
	if (statisticResult.length === 0) return statisticResult;

	const books = await Book.find({}).select("id name image");

	const includedBooks = new Set();

	for (const statistic of statisticResult) {
		includedBooks.add(statistic.id.toString());
	}

	for (const book of books) {
		if (!includedBooks.has(book.id.toString())) {
			const missingBook = { id: book.id, name: book.name, image: book.image };

			for (const key of keys) {
				missingBook[key] = 0;
			}

			statisticResult.push(missingBook);
		}
	}

	return statisticResult.sort((a, b) => {
		if (a.id > b.id) return 1;
		if (a.id < b.id) return -1;
		return 0;
	});
};
