const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const verifyToken = require("../middleware/auth");

const prisma = new PrismaClient();

// ✅ Créer un événement (promoteur connecté)
router.post("/", verifyToken, async (req, res) => {
  const { title, bannerUrl, description, startDate, endDate } = req.body;
  const { id: userId } = req.user;

  if (!title || !startDate || !endDate) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  try {
    const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        bannerUrl,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId,
      },
    });

    res.status(201).json({ message: "Événement créé", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Lister mes événements (admin ou promoteur)
router.get("/", verifyToken, async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    const events = await prisma.event.findMany({
      where: role === "ADMIN" ? {} : { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
