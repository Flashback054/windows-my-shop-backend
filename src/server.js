const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Catch SYNC Exception (like using unknown variable,...)
process.on("uncaughtException", (err) => {
	console.log("UNCAUGHT EXCEPTION! Shutting down server...");
	console.log(err.name, ": ", err.message);
	console.log("Stack: ", err.stack);
	process.exit(1);
});

dotenv.config({ path: path.join(__dirname, "configs", ".env") });

const DB = process.env.DATABASE.replace(
	"<PASSWORD>",
	process.env.DATABASE_PASSWORD
);

let server;
mongoose.connect(DB).then((con) => {
	console.log("Connect to DB successfully.");

	/* eslint-disable global-require */
	const app = require("./app");
	/* eslint-enable global-require */

	const PORT = process.env.PORT || 6969;

	server = app.listen(PORT, "0.0.0.0", () => {
		console.log(`Server started! Listening on port ${PORT}`);
	});
});

// Catch ASYNC Rejection (like failed DB connection,...)
process.on("unhandledRejection", (err) => {
	console.log("UNHANDLE REJECTION! Shutting down server...");
	console.log(err.name, ": ", err.message);
	console.log("Stack:", err.stack);
	// Give server time to complete req currently being processed
	if (server)
		server.close(() => {
			// process.exit(0) : success, (1) : error
			process.exit(1);
		});
});
