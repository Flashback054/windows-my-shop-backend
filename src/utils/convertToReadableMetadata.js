module.exports = function (details) {
	const metadata = {};

	details.forEach((detail) => {
		const key = detail.path[2] || detail.path[1] || detail.path[0];
		metadata[key] = detail.message;
	});

	return metadata;
};
