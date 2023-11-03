const mongoose = require("mongoose");

mongoose
  .connect(process.env.CONNECT_USER_PASSWORD)
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));
