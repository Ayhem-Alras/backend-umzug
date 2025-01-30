require("dotenv").config(); // Laden der Umgebungsvariablen
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;

// Erlaubte Ursprünge für Anfragen (CORS)
const allowedOrigins = [
  "https://frontend-umzug.vercel.app", // أضف هذا النطاق الجديد
  /^https:\/\/frontend-umzug-[a-z0-9]+-ayhem-alras-projects\.vercel\.app$/ // الأنماط السابقة
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(pattern => (typeof pattern === "string" ? pattern === origin : pattern.test(origin)))) {
      callback(null, true);
    } else {
      callback(new Error(`❌ CORS blockiert: ${origin} ist nicht in der Liste der erlaubten Ursprünge`));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));


// Middleware
app.use(bodyParser.json());

// Haupt-Route zur Server-Überprüfung
app.get("/", (req, res) => {
  res.status(200).send("🚀 Server läuft erfolgreich.");
});

// Route zum Senden von E-Mails
app.post("/send", async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Überprüfung der Eingabedaten
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "Bitte füllen Sie alle Felder aus!" });
  }

  try {
    // Konfiguration von Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL, // E-Mail-Adresse
        pass: process.env.PASSWORD, // Passwort oder App-Passwort
      },
    });

    // E-Mail-Details
    const mailOptions = {
      from: `"Kontaktformular" <${process.env.EMAIL}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `Neue Nachricht von ${name}`,
      text: `Name: ${name}\nE-Mail: ${email}\nTelefon: ${phone}\n\nNachricht:\n${message}`,
    };

    // E-Mail senden
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Die Nachricht wurde erfolgreich gesendet!" });
  } catch (error) {
    console.error("Fehler beim Senden der E-Mail:", error);
    res.status(500).json({ error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
