const mongoose = require("mongoose");

mongoose
  .connect(process.env.CONNECT_USER_PASSWORD)
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((error) => {
    console.log("Connection failed!", error);
  });
