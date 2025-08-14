const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
// app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000"], // ton front local
    credentials: true,
  })
);


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
