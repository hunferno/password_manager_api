const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const mailerService = require("../lib/services/mailerService");

register = async (req, res) => {
  const { email, password } = req.body;

  // generate OPT Code with 6 characters
  const randomString = randomstring.generate({
    length: 6,
    charset: "numeric",
  });

  const code = jwt.sign(
    { verificationCode: randomString },
    process.env.JWT_SECRET_TOKEN,
    { expiresIn: "15m" }
  );

  try {
    //user existant ?
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      //psw crypt
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(password, salt);

      const user = await UserModel.create({
        email,
        password: hashedPassword,
        verificationCode: code,
      });

      if (!user) {
        res.status(401).json({
          message: "La création du l'utilisateur a échoué",
        });
        return;
      }

      mailerService(email, randomString, res);
    } else if (existingUser.verificationCode.length > 1) {
      //Check code validity
      const decodedCode = jwt.verify(
        existingUser.verificationCode,
        process.env.JWT_SECRET_TOKEN,
        (err, info) => {
          if (err) return false;
          return info;
        }
      );

      if (!decodedCode) {
        // update user in db
        UserModel.findByIdAndUpdate(
          { _id: existingUser._id },
          { $set: { verificationCode: code } },
          { new: true }
        ).then(() => {
          // Send new verification code
          mailerService(email, randomString, res);
        });
        return;
      }
      // Resend verification existing code
      mailerService(email, decodedCode.verificationCode, res);
    } else if (existingUser.verificationCode === null) {
      //psw crypt
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(password, salt);

      // update user in db
      await UserModel.findByIdAndUpdate(
        existingUser._id,
        {
          email,
          password: hashedPassword,
          verificationCode: code,
        },
        { new: true }
      );

      mailerService(email, randomString, res);
    } else {
      res.status(403).json({ message: "L'utilisateur existe déjà" });
    }
  } catch (error) {
    res.status(500).json({
      error,
      message: "Une erreur s'est produite lors de la création de l'utilisateur",
    });
  }
};

registerVerification = async (req, res) => {
  const { email, receivedCode } = req.body;

  try {
    //user existant ?
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      res.status(403).json({ message: "Email non reconnu" });
      return;
    } else if (
      existingUser.verificationCode === "" ||
      existingUser.verificationCode === null
    ) {
      res.status(403).json({
        message: "Votre compte est déjà vérifié",
      });
      return;
    }

    // decode received code
    const decodedCode = jwt.verify(
      existingUser.verificationCode,
      process.env.JWT_SECRET_TOKEN,
      (err, info) => {
        if (err) return false;
        return info;
      }
    );

    if (!decodedCode) {
      return res.status(401).json({
        message: "Le code a expiré. Veuillez recommencez la procédure",
      });
    }

    // check if received code is valid
    if (decodedCode.verificationCode === receivedCode) {
      // update user in db
      await UserModel.updateOne({ email }, { $set: { verificationCode: "" } });
      res.status(201).json({ message: "Votre compte est maintenant actif" });
      return;
    } else {
      res.status(403).json({ message: "Mauvais code de vérification" });
      return;
    }
  } catch (error) {
    res.status(500).json({
      error,
      message: "Une erreur s'est produite lors de la vérification du code",
    });
  }
};

resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    //user existant ?
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      res.status(403).json({ message: "Email non reconnu" });
      return;
    } else if (existingUser.verificationCode === null) {
      res.status(403).json({
        message: "Votre compte n'existe pas",
      });
      return;
    }

    // generate OPT Code with 6 characters
    const randomString = randomstring.generate({
      length: 6,
      charset: "numeric",
    });

    //hash new verification code
    const newCode = jwt.sign(
      { verificationCode: randomString },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "15m" }
    );

    // check if user has waiting verification code
    if (existingUser.verificationCode.length > 0) {
      // decode received code
      const decodedCode = jwt.verify(
        existingUser.verificationCode,
        process.env.JWT_SECRET_TOKEN,
        (err, info) => {
          if (err) {
            // update user in db
            UserModel.findByIdAndUpdate(
              { _id: userToUpdate._id },
              { $set: { verificationCode: newCode } },
              { new: true }
            ).then(() => {
              // Send new verification code
              mailerService(email, randomString, res);
            });
          }
          return info;
        }
      );

      // Resend verification existing code
      mailerService(email, decodedCode.verificationCode, res);
    } else {
      // Send new verification code
      mailerService(email, randomString, res);

      // update user in db
      await UserModel.findByIdAndUpdate(
        existingUser._id,
        {
          verificationCode: newCode,
        },
        { new: true }
      );
    }
  } catch (error) {
    res.status(500).json({
      error,
      message: "Une erreur s'est produite lors de la vérification du code",
    });
  }
};

isEmailExistsInDB = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (user && user.verificationCode == "") {
      res.status(200).json({ isExist: true });
    } else {
      res.status(200).json({ isExist: false });
    }
  } catch (error) {
    res.status(500).json({
      error,
      message: "Une erreur s'est produite lors de la vérification de l'email",
    });
  }
};

login = async (req, res) => {
  const { email, password } = req.body;

  try {
    //user existant ?
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      // check if user is verified
      if (existingUser.verificationCode !== "") {
        res.status(403).json({
          message: "Vous n'avez pas confirmé votre email",
        });
        return;
      }

      //psw compare
      const matchPsw = await bcrypt.compare(password, existingUser.password);

      if (!matchPsw) {
        res.status(401).json({ message: "Mot de passe incorrect" });
        return;
      }

      //create JWT Token
      const token = jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_SECRET_TOKEN,
        { expiresIn: "15d" }
      );

      //Suppression du password dans la réponse
      existingUser._doc.password = null;

      const userInfo = { ...existingUser._doc, jwt: token };

      res.status(200).json({
        userInfo,
      });
    } else {
      res.status(403).json({ message: "Email non reconnu" });
      return;
    }
  } catch (error) {
    res.status(500).json({
      error,
      message:
        "Une erreur s'est produite lors de la connexion de l'utilisateur",
    });
  }
};

resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    // find user by email
    const userToUpdate = await UserModel.findOne({ email });

    if (!userToUpdate) {
      res.json({ status: 403, message: "Email non reconnu" });
      return;
    }

    // hash pass before storing in db
    const salt = await bcrypt.genSalt();
    hashedPassword = await bcrypt.hash(password, salt);

    // save pass in user
    await UserModel.findByIdAndUpdate(
      { _id: userToUpdate._id },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    res.status(201).json({ message: "Mot de passe mis à jour" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "La réinitialisation du mot de passe à écouhé" });
  }
};

logout = async (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Cookie cleared" });
};

verifyTokenValidity = async (req, res) => {
  try {
    const { token } = req.body;
    // const user = await UserModel.findOne({ email });
    if (!token) return res.status(401).json({ message: "No token provided" });

    //  check if user token is valid
    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, _) => {
      if (err)
        return res.status(401).json({ status: 401, message: "Expired token" });

      return res.status(200).json({ message: "Valid token" });
    });
  } catch (err) {
    res.status(500).json({ message: "Check validity token failed" });
  }
};

module.exports = {
  register,
  registerVerification,
  resendVerificationCode,
  isEmailExistsInDB,
  login,
  verifyTokenValidity,
  resetPassword,
  logout,
};
