const mongoose = require("mongoose");

const identificationSchema = new mongoose.Schema(
  {
    website: {
      type: String,
      required: true,
      lowercase: true,
      trimp: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trimp: true,
    },
    password: {
      type: String,
      required: true,
      max: 1024,
      minLength: 8,
    },
  },
  {
    timestamps: true,
  }
);

const identificationModel = mongoose.model(
  "identification",
  identificationSchema
);

module.exports = identificationModel;
