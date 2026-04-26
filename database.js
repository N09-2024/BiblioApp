import * as SQLite from 'expo-sqlite';

let db;

export async function initDB() {
  db = await SQLite.openDatabaseAsync('bibliotheque.db');
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
      date_lecture TEXT
    );
  `);
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
    `INSERT INTO livres (titre, auteur, genre, nb_pages, note, lu, favori, date_lecture)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [livre.titre, livre.auteur, livre.genre, livre.nb_pages, livre.note, livre.lu, 0, livre.date_lecture]
  );
}

export async function modifierLivre(livre) {
  await db.runAsync(
    `UPDATE livres SET titre=?, auteur=?, genre=?, nb_pages=?, note=?, lu=?, date_lecture=? WHERE id=?`,
    [livre.titre, livre.auteur, livre.genre, livre.nb_pages, livre.note, livre.lu, livre.date_lecture, livre.id]
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