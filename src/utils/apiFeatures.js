class APIFeatures {
	// query is the Query Obj (like the result of Tour.find());
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter() {
		// 1A) Filtering
		let queryObj = { ...this.queryString };

		const excludedFields = ["page", "sort", "limit", "fields"];
		excludedFields.forEach((el) => delete queryObj[el]);

		// 1B) Advanced filtering
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
		queryObj = JSON.parse(queryStr);

		// Implement search
		if (queryObj.q) {
			const searchField = queryObj["search-field"] || "name";
			queryObj[searchField] = { $regex: `${queryObj.q}`, $options: "i" };
			delete queryObj.q;
			delete queryObj["search-field"];
		}

		this.query = this.query.find(queryObj);
		this.filterObj = queryObj;
		return this;
	}

	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.replace(/,/g, " ");
			this.query = this.query.sort(sortBy);
			// this.query.sort('price ratingsAverage');
		} else {
			this.query = this.query.sort("-_id");
		}

		return this;
	}

	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.replace(/,/g, " ");
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select("-__v");
		}

		return this;
	}

	paginate() {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 100;
		const skipValue = (page - 1) * limit;

		// query.skip: skip a number of docs from beginning
		// query.limit : limit output to a custom number
		this.query = this.query.skip(skipValue).limit(limit);

		return this;
	}
}

module.exports = APIFeatures;
