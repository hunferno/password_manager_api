const mongoose = require("mongoose");

const identificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    name: {
      type: String,
      required: true,
      lowercase: true,
      trimp: true,
    },
    category: {
      type: String,
      required: false,
      lowercase: true,
      trimp: true,
      default: "Autre",
    },
    url: {
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
    iv: {
      type: String,
      default: null,
    },
    twoFACode: {
      type: String,
      default: null,
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
