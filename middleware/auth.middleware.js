const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

checkUserAuth = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_SECRET_TOKEN,
      async (err, decodedToken) => {
        if (err) {
          res
            .status(401)
            .json({ message: "Vos identifications sont invalides." });
        } else {
          let user = await UserModel.findById(decodedToken.userId);
          //   res.locals.user = user;
          if (user._id.toString() === decodedToken.userId) {
            next();
          } else {
            res.status(401).json({
              message: "Vous n'êtes pas autorisé à effectuer cette demande.",
            });
          }
        }
      }
    );
  } else {
    res
      .status(404)
      .json({ message: "Vous n'avez pas les autorisations appropriées." });
  }
};

module.exports = { checkUserAuth };
