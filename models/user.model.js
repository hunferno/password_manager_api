const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
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
    verificationCode: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
