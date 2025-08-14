const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const verifyToken = require("../middleware/auth");

const prisma = new PrismaClient();

// ✅ Ajouter un nominé à une catégorie
router.post("/", verifyToken, async (req, res) => {
  const { name, photo, description, categoryId } = req.body;

  if (!name || !photo || !categoryId) {
    return res.status(400).json({ error: "name, photo et categoryId requis" });
  }

  try {
    const nominee = await prisma.nominee.create({
      data: {
        name,
        photo,
        description,
        categoryId,
      },
    });

    res.status(201).json({ message: "Nominé ajouté", nominee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Supprimer un nominé
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.nominee.delete({ where: { id } });
    res.json({ message: "Nominé supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur ou ID invalide" });
  }
});

router.get("/category/:categoryId", async (req, res) => {
  const { categoryId } = req.params;

  try {
    const nominees = await prisma.nominee.findMany({
      where: { categoryId },
      include: {
        votes: {
          where: { status: true },
          select: { quantity: true },
        },
      },
    });

    // Calculer le total des votes pour chaque nominé
    const result = nominees.map((n) => ({
      id: n.id,
      name: n.name,
      photo: n.photo,
      totalVotes: n.votes.reduce((sum, v) => sum + v.quantity, 0),
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Modifier un nominé
router.patch("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, photo, description } = req.body;

  try {
    const nominee = await prisma.nominee.update({
      where: { id },
      data: {
        name,
        photo,
        description,
      },
    });

    res.json({ message: "Nominé mis à jour", nominee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur ou ID invalide" });
  }
});



module.exports = router;
