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
        verificationCode: randomString,
      });

      if (!user) {
        res.status(401).json({
          message: "La création du l'utilisateur a échoué",
        });
        return;
      }

      mailerService(email, randomString, res);
    } else if (existingUser.verificationCode !== "") {
      //psw crypt
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(password, salt);

      // update user in db
      await UserModel.findByIdAndUpdate(existingUser._id, {
        email,
        password: hashedPassword,
        verificationCode: randomString,
      });

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
  const { email, verificationCode } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(403).json({ message: "Email non reconnu" });
      return;
    }

    // verfication code
    if (user.verificationCode === null) {
      res.status(403).json({
        message: "Il n'y a pas de vérification à effectuer",
      });
      return;
    } else if (user.verificationCode !== verificationCode) {
      res.json({ message: "Mauvais code de vérification", status: 403 });
      return;
    }

    // reset verificationCode in user
    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      { $set: { verificationCode: "" } }
    );
    res.json({ user: user._id });
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

    if (user) {
      res.status(200).json({ isExist: true });
    } else {
      res.status(400).json({ isExist: false });
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
        { expiresIn: "30d" }
      );

      //Suppression du password dans la réponse
      existingUser._doc.password = null;

      const userInfo = { ...existingUser._doc, jwt: token };

      res.json({
        userInfo,
      });
    } else {
      res.status(403).json({ message: "Email non reconnu" });
    }
  } catch (error) {
    res.status(500).json({
      error,
      message:
        "Une erreur s'est produite lors de la connexion de l'utilisateur",
    });
  }
};

// forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     //user existant ?
//     const user = await UserModel.findOne({ email });

//     if (user) {
//       //generate rdm string
//       const randomString = randomstring.generate(8);
//       // apply JWT for making expired token
//       const forgotPasswordJWT = jwt.sign(
//         { forgotPassword: randomString },
//         process.env.JWT_SECRET_TOKEN,
//         { expiresIn: "15m" }
//       );
//       // update user psw token
//       const data = await UserModel.updateOne(
//         { email },
//         { $set: { resetPasswordToken: forgotPasswordJWT } }
//       );
//       // create transporter
//       const transporter = nodemailer.createTransport({
//         host: process.env.HOST_TRANSPORT,
//         port: process.env.TLS_PORT_TRANSPORT,
//         secure: false,
//         requireTLS: true,
//         auth: {
//           user: process.env.EMAIL_TRANSPORT,
//           pass: process.env.PASSWORD_TRANSPORT,
//         },
//       });

//       //create transport options
//       const mailOptions = {
//         from: process.env.EMAIL_TRANSPORT,
//         to: user.email,
//         subject: "Reset password",
//         html: `<p><b>Bonjour ${user.pseudo},</b>
//       <br/>
//       <br/>
//       Vous avez récemment demandé le renouvellement de votre mot de passe.
//       Veuillez copier le code ci-dessous et le coller dans votre application :
//       <br/>
//       <br/>
//       <b>${randomString}</b>
//       <br/>
//       <br/>
//       Ce code a un délai d'expiration de 15mn, au delà duquel vous devrez recommencer le processus.
//       <br/>
//       <br/>
//       Cordialement,
//       <br/>
//       L'équipe Tontimillion
//       </p>`,
//       };

//       // sending email
//       transporter.sendMail(mailOptions, (err, info) => {
//         if (err)
//           return res.json({
//             message: "Something wrong with the process",
//             status: 404,
//           });
//         return res.json({
//           message: "Please check your inbox of email",
//           status: 200,
//         });
//       });
//     } else {
//       res.json({ message: "Unknown user email", status: 403 });
//     }
//   } catch (err) {
//     res.json({ err, status: 500 });
//   }
// };

// resetPassword = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     // find user by token
//     const userToUpdate = await UserModel.findOne({ email });

//     if (userToUpdate) {
//       //check if token still validate
//       jwt.verify(
//         userToUpdate.resetPasswordToken,
//         process.env.JWT_SECRET_TOKEN,
//         (err, _) => {
//           if (err) return res.json({ status: 401, message: "Expired token" });
//         }
//       );

//       // hash pass before storing in db
//       const salt = await bcrypt.genSalt();
//       hashedPassword = await bcrypt.hash(password, salt);

//       // save pass in user
//       await UserModel.findByIdAndUpdate(
//         { _id: userToUpdate._id },
//         { $set: { password: hashedPassword, resetPasswordToken: "" } },
//         { new: true }
//       );
//       res.json({ status: 201, message: "Password updated" });
//     } else {
//       res.json({ status: 401, message: "Unknown or Expired Token" });
//     }
//   } catch (err) {
//     res.json({ err, status: 500 });
//   }
// };

logout = async (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Cookie cleared" });
};

verifyTokenValidity = async (req, res) => {
  try {
    const { token, email } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      //  check if user token is valid
      const userToken = user.resetPasswordToken;
      jwt.verify(userToken, process.env.JWT_SECRET_TOKEN, (err, validToken) => {
        if (err)
          return res
            .status(401)
            .json({ status: 401, message: "Expired token" });
        // compare usertoken & token sent by user
        if (validToken.forgotPassword !== token.trim())
          return res
            .status(401)
            .json({ status: 401, message: "Expired token" });
        else return res.json({ message: "Valid token" });
      });
    } else {
      res.status(403).json({ message: "Unknown user email" });
    }
  } catch (err) {
    res.status(500).json({ message: "Check validity token failed" });
  }
};

module.exports = {
  register,
  registerVerification,
  isEmailExistsInDB,
  login,
  //   forgotPassword,
  //   resetPassword,
  logout,
  //   verifyTokenValidity,
};
