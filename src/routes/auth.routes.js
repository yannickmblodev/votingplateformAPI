const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const bcrypt = require("bcryptjs");
const verifyToken = require("../middleware/auth.middleware");
const jwt = require("jsonwebtoken");
const requireAdmin = require("../middleware/requireAdmin");


const prisma = new PrismaClient();

// ✅ Route d'inscription
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Tous les champs sont requis" });

    // Vérifier si l'email est déjà pris
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(409).json({ error: "Email déjà utilisé" });

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "Compte créé avec succès",
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Route de connexion
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email et mot de passe requis" });

    // Trouver l’utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ error: "Identifiants incorrects" });

    // Comparer les mots de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ error: "Identifiants incorrects" });

    // Générer un token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Récupérer les infos de l'utilisateur connecté
router.get("/me", verifyToken, async (req, res) => {
  try {
    const { id } = req.user;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        validatedAt: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Valider un promoteur par l’admin
router.post("/validate-promoter/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        validatedAt: new Date(),
      },
    });

    res.json({ message: "Promoteur validé", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
