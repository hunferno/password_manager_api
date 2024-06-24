const { encrypt, decrypt } = require("../lib/services/cryptoServices");
const IdentificationModel = require("../models/identification.model");

createIdentification = async (req, res) => {
  const { name, category, url, username, password, twoFACode } = req.body;
  const { iv, encrypted } = encrypt(password);

  try {
    const newIdentification = await IdentificationModel.create({
      userId: res.userId,
      name,
      category,
      url,
      username,
      password: encrypted,
      iv,
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
  const userId = res.userId;

  try {
    const identifications = await IdentificationModel.find({ userId: userId });
    if (!identifications) {
      res.status(401).json({
        message: "La récupération des identifications a échoué",
      });
      return;
    }

    identifications.map((identification) => {
      identification.password = decrypt(
        identification.password,
        identification.iv
      );
    });
    res.status(200).json(identifications);
  } catch (err) {
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des données",
    });
  }
};

searchItems = async (req, res) => {
  const userId = res.userId;
  const { term } = req.params;

  if (term.length < 3) {
    res.status(400).json({
      message:
        "La recherche doit contenir au moins 3 caractères pour être validée",
    });
    return;
  }

  try {
    const identifications = await IdentificationModel.find({
      userId: userId,
      $or: [
        { name: { $regex: term, $options: "i" } },
        { url: { $regex: term, $options: "i" } },
        { username: { $regex: term, $options: "i" } },
      ],
    });
    if (!identifications) {
      res.status(401).json({
        message: "La recherche des identifications a échoué",
      });
      return;
    }

    identifications.map((identification) => {
      identification.password = decrypt(
        identification.password,
        identification.iv
      );
    });

    res.status(200).json(identifications);
  } catch (err) {
    res.status(500).json({
      message: "Une erreur est survenue lors de la recherche des données",
    });
  }
};

updateIdentificationById = async (req, res) => {
  const { id } = req.params;
  const { name, category, url, username, password, twoFACode } = req.body;
  const { iv, encrypted } = encrypt(password);

  try {
    const updatedIdentification = await IdentificationModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          category,
          url,
          username,
          password: encrypted,
          iv,
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
  searchItems,
  updateIdentificationById,
  deleteIdentificationById,
};
