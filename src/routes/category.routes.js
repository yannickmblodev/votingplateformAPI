const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const verifyToken = require("../middleware/auth");

const prisma = new PrismaClient();

// ✅ Créer une catégorie pour un événement
router.post("/", verifyToken, async (req, res) => {
  const { eventId, title } = req.body;

  if (!eventId || !title)
    return res.status(400).json({ error: "eventId et title sont requis" });

  try {
    const category = await prisma.category.create({
      data: {
        title,
        eventId,
      },
    });

    res.status(201).json({ message: "Catégorie créée", category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Liste des catégories d’un événement
router.get("/event/:eventId", verifyToken, async (req, res) => {
  const { eventId } = req.params;

  try {
    const categories = await prisma.category.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Modifier une catégorie
router.patch("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) return res.status(400).json({ error: "Le titre est requis" });

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: { title },
    });

    res.json({ message: "Catégorie mise à jour", category: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Supprimer une catégorie
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.category.delete({ where: { id } });
    res.json({ message: "Catégorie supprimée avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur ou ID invalide" });
  }
});


module.exports = router;
