const IdentificationModel = require("../models/identification.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

createIdentification = async (req, res) => {
  const { name, category, url, username, password, twoFACode } = req.body;

  const salt = await bcrypt.genSalt();
  const cryptedPassword = await bcrypt.hash(password, salt);

  try {
    const newIdentification = await IdentificationModel.create({
      name,
      category,
      url,
      username,
      password: cryptedPassword,
      twoFACode,
    });

    if (!newIdentification) {
      res.status(401).json({
        message: "La création de l'identification a échoué",
      });
      return;
    }

    res.status(201).json({
      message: "L'identification a été créée avec succès",
    });
  } catch (err) {
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la création de l'identification",
    });
  }
};

getAllIdentifications = async (_, res) => {
  try {
    const identifications = await IdentificationModel.find();
    res.status(200).json(identifications);
  } catch (err) {
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des données",
    });
  }
};

updateIdentificationById = async (req, res) => {
  const { id } = req.params;
  const { name, category, url, username, password, twoFACode } = req.body;

  const salt = await bcrypt.genSalt();
  const cryptedPassword = await bcrypt.hash(password, salt);

  try {
    const updatedIdentification = await IdentificationModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          category,
          url,
          username,
          password: cryptedPassword,
          twoFACode,
        },
      },
      { new: true }
    );

    if (!updatedIdentification) {
      res.status(401).json({
        message: "La mise à jour de l'identification a échoué",
      });
      return;
    }

    res.status(201).json({
      message: "L'identification a été mise à jour avec succès",
    });
  } catch (err) {
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la mise à jour de l'identification",
    });
  }
};

deleteIdentificationById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedIdentification = await IdentificationModel.findByIdAndDelete({
      _id: id,
    });

    if (!deletedIdentification) {
      res.status(401).json({
        message: "La suppression de l'identification a échoué",
      });
      return;
    }

    res.status(201).json({
      message: "L'identification a été supprimée avec succès",
    });
  } catch (err) {
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la suppression de l'identification",
    });
  }
};

module.exports = {
  createIdentification,
  getAllIdentifications,
  updateIdentificationById,
  deleteIdentificationById,
};