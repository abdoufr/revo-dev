/**
 * Initialize Turso / SQLite database schema
 * Run: node scripts/init-db.js
 *
 * Creates all tables needed for Dev Showcase.
 * Safe to run multiple times (uses IF NOT EXISTS).
 */

require('dotenv').config();
const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function initDb() {
  console.log('🔧 Initialisation de la base de données...');
  console.log(`📍 URL: ${process.env.TURSO_DATABASE_URL || 'file:local.db'}`);

  await db.batch([
    // Config table (hero, stats, theme, contactInfo stored as JSON)
    {
      sql: `CREATE TABLE IF NOT EXISTS config (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
      args: []
    },

    // Projects table
    {
      sql: `CREATE TABLE IF NOT EXISTS projects (
        id            TEXT PRIMARY KEY,
        title         TEXT NOT NULL,
        category      TEXT NOT NULL,
        categoryLabel TEXT DEFAULT 'Projet',
        shortDesc     TEXT DEFAULT '',
        fullDesc      TEXT DEFAULT '',
        image         TEXT DEFAULT '/assets/images/loyalty_app.png',
        technologies  TEXT DEFAULT '[]',
        features      TEXT DEFAULT '[]',
        demoUrl       TEXT DEFAULT '#',
        githubUrl     TEXT DEFAULT '#',
        created_at    INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      args: []
    },

    // Skills table
    {
      sql: `CREATE TABLE IF NOT EXISTS skills (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        category      TEXT NOT NULL UNIQUE,
        categoryTitle TEXT,
        icon          TEXT DEFAULT 'fa-code',
        items         TEXT DEFAULT '[]'
      )`,
      args: []
    },

    // Messages table
    {
      sql: `CREATE TABLE IF NOT EXISTS messages (
        id          TEXT PRIMARY KEY,
        senderName  TEXT NOT NULL,
        senderEmail TEXT NOT NULL,
        projectType TEXT DEFAULT 'general',
        message     TEXT NOT NULL,
        createdAt   TEXT NOT NULL,
        created_at  INTEGER DEFAULT (strftime('%s', 'now'))
      )`,
      args: []
    }
  ]);

  console.log('✅ Tables créées avec succès !');
  console.log('');
  console.log('👉 Prochaine étape : node scripts/seed-db.js');
}

initDb()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  });
