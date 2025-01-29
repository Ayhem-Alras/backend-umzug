require("dotenv").config();
const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "Bitte alle Felder ausfüllen!" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Kontaktformular" <${process.env.EMAIL}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `Neue Nachricht von ${name}`,
      text: `Name: ${name}\nE-Mail: ${email}\nTelefon: ${phone}\n\nNachricht:\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Nachricht erfolgreich gesendet!" });
  } catch (error) {
    console.error("Fehler beim Senden der Nachricht:", error);
    res.status(500).json({ error: "Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut." });
  }
};
