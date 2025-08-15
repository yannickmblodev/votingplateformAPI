// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Important derrière un proxy HTTPS (Render) pour que secure cookies fonctionnent
app.set("trust proxy", 1);

// Parse JSON
app.use(express.json());

// ----- CORS -----
// Renseigne NEXT_PUBLIC_API_URL côté front et FRONTEND_URL côté API en prod.
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL, // ex: https://votefront.vercel.app ou https://mon-domaine.com
].filter(Boolean);

// (Optionnel) autoriser les préviews Vercel : https://xxx-yyy-zzz.vercel.app
const vercelPreviewRegex = /^https:\/\/.*-.*-.*\.vercel\.app$/i;

app.use(
  cors({
    origin: (origin, cb) => {
      // Autoriser les outils sans Origin (Postman, curl, health checks)
      if (!origin) return cb(null, true);
      const ok =
        allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin);
      return ok ? cb(null, true) : cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-app-secret",
    ],
    credentials: true, // nécessaire si tu utilises des cookies
  })
);

// Répondre aux pré-vols (OPTIONS) partout
app.options("*", (req, res) => res.sendStatus(204));

// ----- ROUTES -----
const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const categoryRoutes = require("./routes/category.routes");
const nomineeRoutes = require("./routes/nominee.routes");
const voteRoutes = require("./routes/vote.routes");
const paymentRoutes = require("./routes/payment.routes");

// Monte les routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/nominees", nomineeRoutes);
app.use("/api/vote", voteRoutes);
app.use("/api/payments", paymentRoutes);

// Route test/health
app.get("/", (req, res) => {
  res.send("API Awards Online is running ✅");
});

// ----- ERREUR GLOBALE CORS (message plus clair) -----
app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({
      ok: false,
      error: "CORS_BLOCKED",
      message:
        "Origine non autorisée par CORS. Ajoute ton domaine dans FRONTEND_URL.",
      origin: req.headers.origin || null,
      allowed: allowedOrigins,
    });
  }
  next(err);
});

// (optionnel) handler d'erreurs génériques
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ ok: false, error: "SERVER_ERROR" });
});

// ----- LANCEMENT -----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
