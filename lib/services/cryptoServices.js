const crypto = require("crypto");

// Fonction pour chiffrer un mot de passe
module.exports.encrypt = (text, existingIv = null) => {
  const iv = existingIv ?? crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.CYPHER_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    iv: iv.toString("hex"),
    encrypted: encrypted.toString("hex"),
  };
};

// Fonction pour déchiffrer un mot de passe
module.exports.decrypt = (text, iv) => {
  const encrypted = Buffer.from(text, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.CYPHER_KEY, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};
