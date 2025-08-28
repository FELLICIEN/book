const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'books.db');

// Création et connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
    }
});

// Création de la table des livres
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table:', err.message);
        } else {
            console.log('Table "books" créée ou déjà existante.');

            // Vérifier si la table est vide
            db.get("SELECT COUNT(*) as count FROM books", (err, row) => {
                if (err) {
                    console.error('Erreur lors de la vérification des données:', err.message);
                } else if (row.count === 0) {
                    // Insertion de quelques livres de démonstration si la table est vide
                    console.log('Insertion de livres de démonstration...');
                    const insert = db.prepare("INSERT INTO books (title, author) VALUES (?, ?)");
                    insert.run("Le Petit Prince", "Antoine de Saint-Exupéry");
                    insert.run("1984", "George Orwell");
                    insert.run("Harry Potter à l'école des sorciers", "J.K. Rowling");
                    insert.finalize();
                }
            });
        }
    });
});

module.exports = db;