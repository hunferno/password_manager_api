const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");

updateUserById = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = res.userId;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ message: `L'utilisateur : ${userId} est inconnu` });
    }

    // Compare user pswd with oldPassword
    const matchPsw = await bcrypt.compare(oldPassword, user.password);

    if (!matchPsw) {
      res
        .status(401)
        .json({ message: "Votre ancien mot de passe est incorrect" });
      return;
    }

    //Hash new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
        },
      },
      { new: true }
    );
    return res.status(201).json({
      message: "L'utilisateur a été mis à jour avec succès",
    });
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
