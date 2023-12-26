const express = require("express");
const statisticController = require("../controllers/statistic.controller");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.use(authController.protect, authController.restrictTo("admin"));

router.get("/count-selling-books", statisticController.countSellingBooks);
router.get("/count-new-orders", statisticController.countNewOrders);
router.get("/top-5-low-stock-books", statisticController.getTop5LowStockBooks);
router.get(
	"/revenue-and-profit-stats",
	statisticController.getRevenueAndProfitStats
);
router.get("/book-sale-stats", statisticController.getBookSaleStats);

module.exports = router;
