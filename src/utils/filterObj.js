module.exports = (obj, ...fields) => {
	const filteredObj = {};
	fields.forEach((field) => {
		if (obj[field]) filteredObj[field] = obj[field];
	});
	return filteredObj;
};
