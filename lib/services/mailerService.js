const nodemailer = require("nodemailer");

mailerService = (email, randomString, res) => {
  // create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.HOST_TRANSPORT,
    port: process.env.TLS_PORT_TRANSPORT,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_TRANSPORT,
      pass: process.env.PASSWORD_TRANSPORT,
    },
  });

  //create transport options
  const mailOptions = {
    to: email,
    // to: user.email,
    subject: "Code de vérification",
    html: `<p><b>Bonjour,</b> 
      <br/>
      <br/>
      Ce code permet la création de votre compte. 
      Veuillez copier le code ci-dessous et le coller dans votre application :
      <br/>
      <br/>
      <b>${randomString}</b>
      <br/>
      <br/>
      Ce code a un délai d'expiration de 15mn, au delà duquel vous devrez recommencer le processus.
      <br/>
      <br/>
      Cordialement,
      <br/>
      L'équipe password manager
      </p>`,
  };

  // sending email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.status(404).json({
        message: "Veuillez vérifier votre connexion internet",
      });
    }

    return res.status(201).json({
      message: "Veuillez vérifier votre boîte de réception e-mail",
    });
  });
};

module.exports = mailerService;
