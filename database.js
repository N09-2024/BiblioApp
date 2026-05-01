import * as SQLite from 'expo-sqlite';

let db = null;

// ─── Guard ──────────────────────────────────────────────────────────────────
function verifierDB() {
  if (!db) throw new Error('Base de données non initialisée. Appelez initDB() en premier.');
}

// ─── Initialisation (appelée UNE seule fois dans App.js) ───────────────────
export async function initDB() {
  db = await SQLite.openDatabaseAsync('bibliotheque.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS livres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      auteur TEXT NOT NULL,
      genre TEXT DEFAULT '',
      nb_pages INTEGER DEFAULT 0,
      note INTEGER DEFAULT 0,
      lu INTEGER DEFAULT 0,
      favori INTEGER DEFAULT 0,
      date_lecture TEXT DEFAULT '',
      photo TEXT
    );
  `);

  // Migrations pour installations existantes (ignorées si colonne déjà présente)
  for (const sql of [
    `ALTER TABLE livres ADD COLUMN photo TEXT;`,
    `ALTER TABLE livres ADD COLUMN description TEXT DEFAULT '';`,
  ]) {
    try { await db.execAsync(sql); } catch (_) {}
  }
}

// ─── Lecture ────────────────────────────────────────────────────────────────
export async function getLivres({ recherche = '', genre = '', statut = -1, noteMin = 0, tri = 'id_desc' } = {}) {
  verifierDB();
  try {
    const terme = `%${recherche}%`;
    const conditions = ['(titre LIKE ? OR auteur LIKE ?)'];
    const params = [terme, terme];

    if (genre)     { conditions.push('genre = ?');  params.push(genre); }
    if (statut >= 0){ conditions.push('lu = ?');    params.push(statut); }
    if (noteMin > 0){ conditions.push('note >= ?'); params.push(noteMin); }

    const orderMap = {
      id_desc:   'ORDER BY id DESC',
      titre_asc: 'ORDER BY LOWER(titre) ASC',
      note_desc: 'ORDER BY note DESC, id DESC',
      date_desc: 'ORDER BY date_lecture DESC, id DESC',
    };

    return await db.getAllAsync(
      `SELECT * FROM livres WHERE ${conditions.join(' AND ')} ${orderMap[tri] ?? orderMap.id_desc}`,
      params
    );
  } catch (e) { console.error('getLivres:', e); return []; }
}

export async function getLivreById(id) {
  verifierDB();
  try { return await db.getFirstAsync('SELECT * FROM livres WHERE id = ?', [id]); }
  catch (e) { console.error('getLivreById:', e); return null; }
}

export async function getFavoris(recherche = '') {
  verifierDB();
  try {
    const terme = `%${recherche}%`;
    return await db.getAllAsync(
      'SELECT * FROM livres WHERE favori = 1 AND (titre LIKE ? OR auteur LIKE ?) ORDER BY LOWER(titre) ASC',
      [terme, terme]
    );
  } catch (e) { console.error('getFavoris:', e); return []; }
}

export async function getGenres() {
  verifierDB();
  try {
    const rows = await db.getAllAsync(
      "SELECT DISTINCT genre FROM livres WHERE genre IS NOT NULL AND genre != '' ORDER BY genre ASC"
    );
    return rows.map(r => r.genre);
  } catch (e) { console.error('getGenres:', e); return []; }
}

export async function getStats() {
  verifierDB();
  try {
    const [total, lus, favoris, noteMoy, genres] = await Promise.all([
      db.getFirstAsync('SELECT COUNT(*) as n FROM livres'),
      db.getFirstAsync('SELECT COUNT(*) as n FROM livres WHERE lu = 1'),
      db.getFirstAsync('SELECT COUNT(*) as n FROM livres WHERE favori = 1'),
      db.getFirstAsync('SELECT AVG(CAST(note AS REAL)) as moy FROM livres WHERE note > 0'),
      db.getAllAsync("SELECT genre, COUNT(*) as n FROM livres WHERE genre IS NOT NULL AND genre != '' GROUP BY genre ORDER BY n DESC LIMIT 6"),
    ]);
    return {
      total:        total.n,
      lus:          lus.n,
      nonLus:       total.n - lus.n,
      favoris:      favoris.n,
      noteMoyenne:  noteMoy.moy ? +noteMoy.moy.toFixed(1) : 0,
      genres,
    };
  } catch (e) { console.error('getStats:', e); return { total: 0, lus: 0, nonLus: 0, favoris: 0, noteMoyenne: 0, genres: [] }; }
}

// ─── Écriture ───────────────────────────────────────────────────────────────
export async function ajouterLivre(livre) {
  verifierDB();
  await db.runAsync(
    `INSERT INTO livres (titre, auteur, genre, nb_pages, note, lu, favori, date_lecture, photo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [livre.titre, livre.auteur, livre.genre ?? '', livre.nb_pages ?? 0,
     livre.note ?? 0, livre.lu ?? 0, livre.favori ?? 0, livre.date_lecture ?? '', livre.photo ?? null]
  );
}

export async function modifierLivre(livre) {
  verifierDB();
  // FIX : favori est maintenant inclus dans le UPDATE
  await db.runAsync(
    `UPDATE livres SET titre=?, auteur=?, genre=?, nb_pages=?, note=?, lu=?, favori=?, date_lecture=?, photo=? WHERE id=?`,
    [livre.titre, livre.auteur, livre.genre ?? '', livre.nb_pages ?? 0,
     livre.note ?? 0, livre.lu ?? 0, livre.favori ?? 0, livre.date_lecture ?? '', livre.photo ?? null, livre.id]
  );
}

export async function supprimerLivre(id) {
  verifierDB();
  await db.runAsync('DELETE FROM livres WHERE id = ?', [id]);
}

export async function toggleFavori(id, favoriActuel) {
  verifierDB();
  await db.runAsync('UPDATE livres SET favori = ? WHERE id = ?', [favoriActuel === 1 ? 0 : 1, id]);
}

export async function mettreAJourPhoto(id, photo) {
  verifierDB();
  await db.runAsync('UPDATE livres SET photo = ? WHERE id = ?', [photo, id]);
}