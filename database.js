import * as SQLite from 'expo-sqlite';

let db;

export async function initDB() {
  db = await SQLite.openDatabaseAsync('bibliotheque.db');

  // Création de la table avec la colonne photo
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS livres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      auteur TEXT NOT NULL,
      genre TEXT,
      nb_pages INTEGER,
      note INTEGER DEFAULT 0,
      lu INTEGER DEFAULT 0,
      favori INTEGER DEFAULT 0,
      date_lecture TEXT,
      photo TEXT
    );
  `);

  // Migration : ajouter la colonne photo si elle n'existe pas encore
  // (pour les installations existantes qui n'ont pas la colonne)
  try {
    await db.execAsync(`ALTER TABLE livres ADD COLUMN photo TEXT;`);
  } catch (e) {
    // La colonne existe déjà, on ignore l'erreur
  }
}

export async function getLivres(recherche = '') {
  const terme = `%${recherche}%`;
  return await db.getAllAsync(
    'SELECT * FROM livres WHERE titre LIKE ? OR auteur LIKE ? ORDER BY id DESC',
    [terme, terme]
  );
}

export async function getFavoris() {
  return await db.getAllAsync('SELECT * FROM livres WHERE favori = 1 ORDER BY id DESC');
}

export async function ajouterLivre(livre) {
  await db.runAsync(
    `INSERT INTO livres (titre, auteur, genre, nb_pages, note, lu, favori, date_lecture, photo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      livre.titre,
      livre.auteur,
      livre.genre,
      livre.nb_pages,
      livre.note,
      livre.lu,
      livre.favori ?? 0,   // respecte la valeur passée, 0 par défaut
      livre.date_lecture,
      livre.photo ?? null,
    ]
  );
}

export async function modifierLivre(livre) {
  await db.runAsync(
    `UPDATE livres SET titre=?, auteur=?, genre=?, nb_pages=?, note=?, lu=?, date_lecture=?, photo=? WHERE id=?`,
    [
      livre.titre,
      livre.auteur,
      livre.genre,
      livre.nb_pages,
      livre.note,
      livre.lu,
      livre.date_lecture,
      livre.photo ?? null,
      livre.id,
    ]
  );
}

export async function supprimerLivre(id) {
  await db.runAsync('DELETE FROM livres WHERE id = ?', [id]);
}

export async function toggleFavori(id, favoriActuel) {
  await db.runAsync(
    'UPDATE livres SET favori = ? WHERE id = ?',
    [favoriActuel === 1 ? 0 : 1, id]
  );
}

export async function mettreAJourPhoto(id, photo) {
  await db.runAsync('UPDATE livres SET photo = ? WHERE id = ?', [photo, id]);
}