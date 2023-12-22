const express = require("express");
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

const orderRouter = require("./order.route");
const paymentRouter = require("./payment.route");

const router = express.Router();

// Orders belong to a user
router.use("/:userId/orders", orderRouter);
router.use("/:userId/payments", paymentRouter);

router.use(authController.protect, authController.restrictTo("admin"));

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUser);
router.post(
	"/",
	userController.uploadUserImage,
	userController.setImagePath,
	userController.createUser
);
router.patch(
	"/:id",
	userController.uploadUserImage,
	userController.setImagePath,
	userController.updateUser
);
router.delete("/:id", userController.deleteUser);

module.exports = router;
