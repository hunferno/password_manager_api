const { encrypt, decrypt } = require("../lib/services/cryptoServices");
const SecuretextModel = require("../models/securetext.model");

createSecureText = async (req, res) => {
  const { title, text, category } = req.body;
  let iv = null;
  let encrypted = null;

  if (text) {
    const cryptotext = encrypt(text);
    iv = cryptotext.iv;
    encrypted = cryptotext.encrypted;
  }

  try {
    const newSecuretext = await SecuretextModel.create({
      userId: res.userId,
      title,
      text: encrypted,
      category,
      iv,
    });

    if (!newSecuretext) {
      res.status(401).json({
        message: "La création de la note sécurisée a échoué",
      });
      return;
    }

    res.status(201).json({
      message: "La note sécurisée a été créée avec succès",
    });
  } catch (err) {
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la création de la note sécurisée",
    });
  }
};

getAllSecureTexts = async (_, res) => {
  const userId = res.userId;

  try {
    const secureTexts = await SecuretextModel.find({ userId: userId });
    if (!secureTexts) {
      res.status(401).json({
        message: "La récupération des notes sécurisées a échoué",
      });
      return;
    }

    secureTexts.map((note) => {
      if (note.text) {
        note.text = decrypt(note.text, note.iv);
      }
    });
    res.status(200).json(secureTexts);
  } catch (err) {
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la récupération des notes sécurisées",
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
    const securetext = await SecuretextModel.find({
      userId: userId,
      $or: [{ title: { $regex: term, $options: "i" } }],
    });
    if (!securetext) {
      res.status(401).json({
        message: "La recherche des notes sécurisées a échoué",
      });
      return;
    }

    res.status(200).json(securetext);
  } catch (err) {
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la recherche des notes sécurisées",
    });
  }
};

updateSecureTextById = async (req, res) => {
  const { id } = req.params;
  const { title, text, category } = req.body;
  let iv = null;
  let encrypted = null;

  if (text) {
    const cryptotext = encrypt(text);
    iv = cryptotext.iv;
    encrypted = cryptotext.encrypted;
  }

  try {
    const previousSecuretext = await SecuretextModel.findById({ _id: id });
    const updatedSecuretext = await SecuretextModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          title,
          text: encrypted ?? previousSecuretext.text,
          category,
          iv : iv ?? previousSecuretext.iv,
        },
      },
      { new: true }
    );

    if (!updatedSecuretext) {
      res.status(401).json({
        message: "La mise à jour de la note sécurisée a échoué",
      });
      return;
    }

    res.status(201).json({
      message: "La note sécurisée a été mise à jour avec succès",
    });
  } catch (err) {
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la mise à jour de la note sécurisée",
    });
  }
};

deleteSecureTextById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSecuretext = await SecuretextModel.findByIdAndDelete({
      _id: id,
    });

    if (!deletedSecuretext) {
      res.status(401).json({
        message: "La suppression de la note sécurisée a échoué",
      });
      return;
    }

    res.status(201).json({
      message: "La note sécurisée a été supprimée avec succès",
    });
  } catch (err) {
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la suppression de la note sécurisée",
    });
  }
};

module.exports = {
  createSecureText,
  getAllSecureTexts,
  searchItems,
  updateSecureTextById,
  deleteSecureTextById,
};
