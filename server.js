const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.routes");
const identificationRoutes = require("./routes/identification.routes");
const securetextRoutes = require("./routes/securetext.routes");
require("dotenv").config({ path: "./config/.env" });
require("./config/db_connexion.js");

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

//routes
app.use("/api/user", userRoutes);
app.use("/api/identification", identificationRoutes);
app.use("/api/securetext", securetextRoutes);

//server
app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
