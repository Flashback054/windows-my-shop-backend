const express = require("express");
require("express-async-errors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const compression = require("compression");
const cors = require("cors");

const globalErrorHandler = require("./controllers/error.controller");

// Import routers
const bookRouter = require("./routes/book.route");
const userRouter = require("./routes/user.route");
const orderRouter = require("./routes/order.route");
const authRouter = require("./routes/auth.route");
const paymentRouter = require("./routes/payment.route");
const statisticRouter = require("./routes/statistic.route");
const categoryRouter = require("./routes/category.route");
const couponRouter = require("./routes/coupon.route");
const reviewRouter = require("./routes/review.route");

const app = express();

// Trust proxy
app.enable("trust proxy");

// CORS;
const allowOrigins = ["http://localhost:5173", "http://localhost:4173"];
app.use(
	cors({
		credentials: true,
		origin: allowOrigins,
	})
);
// Implement CORS on all OPTIONS request
// Browser send OPTIONS req on preflight phase (before non-simple req like PUT,PATCH,DELETE,...)
// -> inorder to verify that the non-simple req is safe to perform
// -> we must set CORS on response
app.options("*", cors());

//////// IMPORTANT : helmet should be used in every Express app
// Security HTTP headers
app.use(
	helmet({
		crossOriginEmbedderPolicy: false,
		crossOriginResourcePolicy: {
			policy: "cross-origin",
		},
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["*"],
				scriptSrc: [
					"* data: 'unsafe-eval' 'unsafe-inline' blob: https://sandbox.vnpayment.vn",
				],
				connectSrc: ["*", "https://sandbox.vnpayment.vn"],
				frameSrc: ["*", "https://sandbox.vnpayment.vn"],
				navigateTo: ["*"],
			},
		},
	})
);

//////// IMPORTANT ////////
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
// replace malicious HTML code : ex : <div id='error-code'></div> -> &lt;div id='error-code'&gt;...
app.use(xss());

// compress all the response text (ex: JSON or HTML)
app.use(compression());

// Body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Set static files
app.use(express.static(`${__dirname}/public`));

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/statistics", statisticRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/reviews", reviewRouter);

// Error handler
app.use(globalErrorHandler);

module.exports = app;
