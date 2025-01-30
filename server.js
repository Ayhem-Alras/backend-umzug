require("dotenv").config(); // تحميل متغيرات البيئة
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;

// السماح بالطلبات فقط من نطاقات محددة
const allowedOrigins = [
  "https://frontend-umzug-45l4j24bv-ayhem-alras-projects.vercel.app",
  "https://frontend-umzug-9p7yrhiae-ayhem-alras-projects.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`❌ CORS Blocked: ${origin} ليس في قائمة المسموح بها`));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));




// Middleware
app.use(bodyParser.json());

// المسار الرئيسي للتحقق من عمل السيرفر
app.get("/", (req, res) => {
  res.status(200).send("🚀 الخادم يعمل بنجاح.");
});

// مسار إرسال البريد الإلكتروني
app.post("/send", async (req, res) => {
  const { name, email, phone, message } = req.body;

  // التحقق من صحة البيانات المدخلة
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "الرجاء ملء جميع الحقول!" });
  }

  try {
    // إعداد Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL, // البريد الإلكتروني
        pass: process.env.PASSWORD, // كلمة المرور أو كلمة مرور التطبيق
      },
    });

    // إعداد بيانات البريد الإلكتروني
    const mailOptions = {
      from: `"نموذج التواصل" <${process.env.EMAIL}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `رسالة جديدة من ${name}`,
      text: `الاسم: ${name}\nالبريد الإلكتروني: ${email}\nالهاتف: ${phone}\n\nالرسالة:\n${message}`,
    };

    // إرسال البريد الإلكتروني
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "تم إرسال الرسالة بنجاح!" });
  } catch (error) {
    console.error("خطأ أثناء إرسال البريد الإلكتروني:", error);
    res.status(500).json({ error: "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى." });
  }
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});