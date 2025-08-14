const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const crypto = require("crypto");

router.post("/", async (req, res) => {
  const { phone, nomineeId, quantity } = req.body;

  if (!phone || !nomineeId) {
    return res.status(400).json({ error: "Téléphone et nomineeId requis" });
  }

  try {
    // Vérifie si le nominé existe
    const nominee = await prisma.nominee.findUnique({
      where: { id: nomineeId },
    });
    if (!nominee) return res.status(404).json({ error: "Nominé introuvable" });

    // Générer une référence unique de transaction
    const transactionRef =
      "VOTE-" + crypto.randomBytes(6).toString("hex").toUpperCase();

    // Créer un vote avec status = false (en attente de paiement)
    const vote = await prisma.vote.create({
      data: {
        phone,
        nomineeId,
        transactionRef,
        status: false,
        quantity: quantity || 1,
      },
    });

    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantité invalide" });
    }

    const amount = 200 * quantity;
    const redirectURL = `https://moneyfusion.net/pay?ref=${transactionRef}&amount=${amount}`;


    res.status(201).json({
      message: "Vote enregistré. En attente de paiement.",
      redirect: redirectURL,
      transactionRef,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
