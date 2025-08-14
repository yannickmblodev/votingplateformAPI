const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
// app.use(cors());
app.use(express.json());
// Si tu es derrière un proxy (Render), active ceci pour les cookies SameSite=None
app.set('trust proxy', 1);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  // ajoute ton domaine front en prod si tu as (ex: 'https://votefront.vercel.app')
];

app.use(
  cors({
    origin: (origin, cb) => {
      // autoriser aussi les outils sans origin (Postman)
      if (!origin) return cb(null, true);
      return allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-app-secret",
    ],
    credentials: true,
  })
);

// (important) répondre aux pré-vols
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));


// ⛳️ Ici, on importe tes routes auth
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

const eventRoutes = require("./routes/event.routes");
app.use("/api/events", eventRoutes);

const categoryRoutes = require("./routes/category.routes");
app.use("/api/categories", categoryRoutes);

const nomineeRoutes = require("./routes/nominee.routes");
app.use("/api/nominees", nomineeRoutes);

const voteRoutes = require("./routes/vote.routes");
app.use("/api/vote", voteRoutes);

const paymentRoutes = require("./routes/payment.routes");
app.use("/api/payments", paymentRoutes);

// Test route simple
app.get("/", (req, res) => {
  res.send("API Awards Online is running ✅");
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
