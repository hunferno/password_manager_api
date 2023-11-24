const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");

updateUserById = async (req, res) => {
  const { password } = req.body;
  const userId = res.userId;
  if (!password) {
    return res.status(401).json({ message: "Le mot de passe est obligatoire" });
  }

  //psw crypt
  const salt = await bcrypt.genSalt();
  hashedPassword = await bcrypt.hash(password, salt);
  password = hashedPassword;

  try {
    const user = await UserModel.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          password,
        },
      },
      { new: true }
    );
    if (!user) {
      return res
        .status(400)
        .json({ message: `L'utilisateur : ${userId} est inconnu` });
    }
  } catch (error) {
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la mise à jour de l'utilisateur",
    });
  }
};

module.exports = {
  updateUserById,
};
