const express = require("express");

const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const { validateRequest } = require("../middlewares/validateRequest");
const loginSchema = require("../schemas/auth/login.schema");
const signupSchema = require("../schemas/auth/signup.schema");
const updateMeSchema = require("../schemas/auth/updateMe.schema");

const router = express.Router();

router.post("/signup", validateRequest(signupSchema), authController.signup);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/logout", authController.logout);

router.use(authController.protect);
router.get("/me", userController.setUserId, userController.getUser);
router.patch(
	"/me",
	userController.uploadUserImage,
	userController.setImagePath,
	userController.updateMe
);

router.patch("/update-password", authController.updatePassword);
router.delete(
	"/me",
	authController.passwordConfirm,
	userController.setUserId,
	userController.deleteUser
);

module.exports = router;
