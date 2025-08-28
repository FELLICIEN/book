const express = require('express');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Middleware de logging pour suivre les requêtes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Route GET /books - Récupérer tous les livres
app.get('/books', (req, res) => {
    const sql = 'SELECT * FROM books ORDER BY id';

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des livres:', err.message);
            return res.status(500).json({
                error: 'Erreur serveur lors de la récupération des livres'
            });
        }

        res.json({
            message: 'Liste des livres récupérée avec succès',
            count: rows.length,
            data: rows
        });
    });
});

// Route POST /books - Ajouter un nouveau livre
app.post('/books', (req, res) => {
    const { title, author } = req.body;

    // Validation des données
    if (!title || !author) {
        return res.status(400).json({
            error: 'Le titre et l\'auteur sont requis'
        });
    }

    // Validation supplémentaire
    if (typeof title !== 'string' || typeof author !== 'string') {
        return res.status(400).json({
            error: 'Le titre et l\'auteur doivent être des chaînes de caractères'
        });
    }

    if (title.trim().length === 0 || author.trim().length === 0) {
        return res.status(400).json({
            error: 'Le titre et l\'auteur ne peuvent pas être vides'
        });
    }

    const sql = 'INSERT INTO books (title, author) VALUES (?, ?)';
    const params = [title.trim(), author.trim()];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Erreur lors de l\'ajout du livre:', err.message);
            return res.status(500).json({
                error: 'Erreur serveur lors de l\'ajout du livre'
            });
        }

        res.status(201).json({
            message: 'Livre ajouté avec succès',
            data: {
                id: this.lastID,
                title: title.trim(),
                author: author.trim()
            }
        });
    });
});

// Route pour la racine - Documentation de l'API
app.get('/', (req, res) => {
    res.json({
        message: 'API de gestion de livres',
        endpoints: {
            'GET /books': 'Récupérer tous les livres',
            'POST /books': 'Ajouter un nouveau livre',
        },
        example: {
            'POST /books': {
                'body': {
                    'title': 'Titre du livre',
                    'author': 'Nom de l\'auteur'
                }
            }
        }
    });
});

// Gestion des routes non trouvées (CORRIGÉ)
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Route non trouvée',
        availableRoutes: ['GET /books', 'POST /books']
    });
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
    console.error('Erreur non gérée:', err);
    res.status(500).json({
        error: 'Erreur interne du serveur'
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`=== Serveur API de livres démarré ===`);
    console.log(`Port: ${PORT}`);
    console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`====================================`);
});

// Gestion propre de la fermeture
process.on('SIGINT', () => {
    console.log('\nArrêt du serveur...');
    db.close((err) => {
        if (err) {
            console.error('Erreur lors de la fermeture de la base de données:', err.message);
        } else {
            console.log('Connexion à la base de données fermée.');
        }
        process.exit(0);
    });
});