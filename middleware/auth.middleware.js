const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

checkUserAuth = async (req, res, next) => {
  // const token = req.cookies.jwt
  const token = req.body.jwt;

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_SECRET_TOKEN,
      async (err, decodeToken) => {
        if (err) {
          //   res.locals.user = null;
          res.clearCookie("jwt");
          res.json({ message: "invalid Credentials", status: 401 });
        } else {
          let user = await UserModel.findById(decodeToken.userId);
          //   res.locals.user = user;
          if (user._id.toString() === decodeToken.userId) {
            next();
          } else {
            res.json({
              message: "Not allow to make that request",
              status: 401,
            });
          }
        }
      }
    );
  } else {
    res.locals.user = null;
    res.json({ message: "Invalid Credentials", status: 401 });
  }
};

checkUserVerifiedAuth = async (req, res, next) => {
  // const token = req.cookies.jwt
  const token = req.body.jwt;

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_SECRET_TOKEN,
      async (err, decodeToken) => {
        if (err) {
          //   res.locals.user = null;
          res.clearCookie("jwt");
          res.json({ message: "invalid Credentials", status: 401 });
        } else {
          let user = await UserModel.findById(decodeToken.userId);
          //   res.locals.user = user;
          if (
            user._id.toString() === decodeToken.userId &&
            (user.role.includes("verified") || user.role.includes("admin"))
          ) {
            next();
          } else {
            res.json({
              message: "Not allow to make that request",
              status: 401,
            });
          }
        }
      }
    );
  } else {
    res.locals.user = null;
    res.json({ message: "Invalid Credentials", status: 401 });
  }
};

checkAdminAuth = (req, res, next) => {
  const token = req.body.jwt;
  if (token) {
    jwt.verify(
      token,
      process.env.JWT_SECRET_TOKEN,
      async (err, decodeToken) => {
        if (err) {
          res.locals.user = null;
          res.clearCookie("jwt");
          res.status(401).json({message: "Not allow to make that request"})
        } else {
          let user = await UserModel.findById(decodeToken.userId);
          res.locals.user = user;
          if (!user.role.includes("admin")) {
            res.status(401).json({ message: "Not allow to make that request" });
          } else {
            next();
          }
        }
      }
    );
  } else {
    res.locals.user = null;
    res.status(401).json({ message: "Invalid Credentials" });
  }
};

module.exports = { checkUserAuth, checkAdminAuth, checkUserVerifiedAuth };
