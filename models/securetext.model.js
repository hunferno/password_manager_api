const mongoose = require("mongoose");

const securetextSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    title: {
      type: String,
      required: true,
      trimp: true,
    },
    text: {
      type: String,
      trimp: true,
      default: "Aucun texte n'a été saisi",
    },
    iv: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const securetextModel = mongoose.model(
  "securetext",
  securetextSchema
);

module.exports = securetextModel;
