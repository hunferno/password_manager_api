const express = require("express");
const securetextController = require("../controllers/securetext.controller");
const middleware = require("../middleware/auth.middleware");

const router = express.Router();

//C-R-U-D
router.post(
  "/create",
  middleware.checkUserAuth,
  securetextController.createSecureText
);
router.get(
  "/get-all",
  middleware.checkUserAuth,
  securetextController.getAllSecureTexts
);
router.get(
  "/search/:term",
  middleware.checkUserAuth,
  securetextController.searchItems
);
router.patch(
  "/update/:id",
  middleware.checkUserAuth,
  securetextController.updateSecureTextById
);
router.delete(
  "/delete/:id",
  middleware.checkUserAuth,
  securetextController.deleteSecureTextById
);

module.exports = router;