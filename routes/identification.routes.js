const express = require("express");
const identificationController = require("../controllers/identification.controller");
const middleware = require("../middleware/auth.middleware");

const router = express.Router();

//C-R-U-D
router.post(
  "/create",
  middleware.checkUserAuth,
  identificationController.createIdentification
);
router.get(
  "/get-all",
  middleware.checkUserAuth,
  identificationController.getAllIdentifications
);
router.get(
  "/search/:term",
  middleware.checkUserAuth,
  identificationController.searchItems
);
router.patch(
  "/update/:id",
  middleware.checkUserAuth,
  identificationController.updateIdentificationById
);
router.delete(
  "/delete/:id",
  middleware.checkUserAuth,
  identificationController.deleteIdentificationById
);

module.exports = router;
