const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

// Endpoint de callback après paiement mobile money
router.post("/callback", async (req, res) => {
  const { transactionRef, status } = req.body;

  if (!transactionRef || !status) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  try {
    // Vérifie si le vote existe
    const vote = await prisma.vote.findUnique({ where: { transactionRef } });
    if (!vote) return res.status(404).json({ error: "Vote introuvable" });

    // Si le paiement est réussi, on valide le vote
    if (status === "SUCCESS") {
      await prisma.vote.update({
        where: { transactionRef },
        data: { status: true },
      });

      return res.status(200).json({ message: "Vote validé avec succès" });
    }

    // Sinon, on laisse le status à false
    return res.status(200).json({ message: "Paiement non validé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
