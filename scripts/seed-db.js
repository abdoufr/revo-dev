/**
 * Migrate data from db.json → Turso/SQLite database
 * Run AFTER init-db.js:  node scripts/seed-db.js
 *
 * This script reads your existing data from data/db.json
 * and inserts it into the Turso database.
 * Safe to re-run (uses INSERT OR REPLACE).
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Read db.json
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

async function seedDb() {
  console.log('🌱 Migration des données depuis db.json...');
  console.log(`📍 Source : ${DB_PATH}`);
  console.log(`📍 Destination : ${process.env.TURSO_DATABASE_URL || 'file:local.db'}`);
  console.log('');

  // --- CONFIG (hero, stats, theme, contactInfo) ---
  console.log('⚙️  Migration de la configuration...');

  const configEntries = [
    ['hero', data.hero || {}],
    ['stats', data.stats || []],
    ['theme', data.theme || 'theme-kupa'],
    ['contactInfo', data.contactInfo || {}]
  ];

  for (const [key, value] of configEntries) {
    await db.execute({
      sql: 'INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)',
      args: [key, JSON.stringify(value)]
    });
    console.log(`  ✅ config["${key}"] migré`);
  }

  // --- PROJECTS ---
  console.log('');
  console.log('📦 Migration des projets...');

  for (const project of (data.projects || [])) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO projects
              (id, title, category, categoryLabel, shortDesc, fullDesc, image, technologies, features, demoUrl, githubUrl)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        project.id,
        project.title,
        project.category,
        project.categoryLabel || 'Projet',
        project.shortDesc || '',
        project.fullDesc || '',
        project.image || '/assets/images/loyalty_app.png',
        JSON.stringify(project.technologies || []),
        JSON.stringify(project.features || []),
        project.demoUrl || '#',
        project.githubUrl || '#'
      ]
    });
    console.log(`  ✅ Projet "${project.title}" migré`);
  }

  // --- SKILLS ---
  console.log('');
  console.log('🛠️  Migration des compétences...');

  for (const skill of (data.skills || [])) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO skills (category, categoryTitle, icon, items)
            VALUES (?, ?, ?, ?)`,
      args: [
        skill.category,
        skill.categoryTitle || skill.category.toUpperCase(),
        skill.icon || 'fa-code',
        JSON.stringify(skill.items || [])
      ]
    });
    console.log(`  ✅ Skill "${skill.categoryTitle}" migré (${(skill.items || []).length} éléments)`);
  }

  // --- MESSAGES ---
  console.log('');
  console.log('📨 Migration des messages...');

  for (const msg of (data.messages || [])) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO messages (id, senderName, senderEmail, projectType, message, createdAt)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        msg.id,
        msg.senderName,
        msg.senderEmail,
        msg.projectType || 'general',
        msg.message,
        msg.createdAt || new Date().toISOString()
      ]
    });
    console.log(`  ✅ Message de "${msg.senderName}" migré`);
  }

  console.log('');
  console.log('🎉 Migration terminée avec succès !');
  console.log('');
  console.log('👉 Testez localement : node server.js');
}

seedDb()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur de migration:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
