require("dotenv").config(); // تحميل متغيرات البيئة
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;  // ✅ تعريف PORT بشكل صحيح

// Middleware
app.use(cors()); // السماح بالطلبات من نطاقات مختلفة (مثل الواجهة الأمامية)
app.use(bodyParser.json()); // السماح بتحليل بيانات JSON

// المسار الرئيسي "/" لمنع خطأ 404
app.get("/", (req, res) => {
  res.send("🚀 Server läuft! API funktioniert.");
});

// POST-Route لإرسال البيانات عبر النموذج
app.post("/send", async (req, res) => {
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
      res.status(500).json({ error: "Fehler beim Senden der Nachricht." });
    }
});

// تشغيل الخادم على المنفذ الصحيح
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
