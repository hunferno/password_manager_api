const express = require("express");
const authController = require("../controllers/auth.controller");
// const userController = require("../controllers/user.controller");
const middleware = require("../middleware/auth.middleware");

const router = express.Router();

//auth
router.post("/register", authController.register);
router.post("/register/verification", authController.registerVerification);
router.post("/isEmailExistsInDB", authController.isEmailExistsInDB);
router.post("/login", authController.login);
// router.post("/forgot_password", authController.forgotPassword);
// router.post("/reset_password", authController.resetPassword);
// router.post("/verify_token_validity", authController.verifyTokenValidity);
router.get("/logout", authController.logout);

//R-U-D
// router.get("/", middleware.checkAdminAuth, userController.getAllUsers);
// router.get("/:id", middleware.checkUserAuth, userController.getUserById);
// router.patch(
//   "/update/:id",
//   middleware.checkUserAuth,
//   userController.updateUserById
// );
// router.delete(
//   "/delete/:id",
//   middleware.checkAdminAuth,
//   userController.deleteUserById
// );

module.exports = router;