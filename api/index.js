/**
 * DEV SHOWCASE — Main Application
 * Works on both Vercel (serverless) and local Node.js
 *
 * Auth:     JWT (httpOnly cookie) — replaces express-session
 * Database: Turso (SQLite cloud) via @libsql/client
 *           Falls back to local SQLite file for local dev
 */

try { require('dotenv').config(); } catch (e) { /* Vercel injects env vars directly */ }


const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { createClient } = require('@libsql/client');

const app = express();

// ==========================================
// TURSO DATABASE CLIENT
// ==========================================
const TURSO_URL = process.env.TURSO_DATABASE_URL || 'file:local.db';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

// Safety check: on Vercel (read-only FS), file: URLs won't work
if (TURSO_URL.startsWith('file:') && process.env.VERCEL) {
  throw new Error(
    '❌ TURSO_DATABASE_URL must be set to a Turso cloud URL (libsql://...) in Vercel env variables!'
  );
}

const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN
});


// ==========================================
// ADMIN AUTH CONFIG
// ==========================================
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ||
  '$2b$12$ONROlzRFP0QRcW9ky3wx3eje9MXCPSi.M0swgB1uQFX4v6WBrFHZy';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-showcase-jwt-secret-2026';

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// JSON parse error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Format JSON invalide.' });
  }
  next();
});

// ==========================================
// PATH RESOLUTION (works locally + Vercel)
// ==========================================
const ROOT = process.cwd();

// ==========================================
// STATIC FILES
// ==========================================
app.use(express.static(path.join(ROOT, 'public')));
app.use('/assets', express.static(path.join(ROOT, 'public', 'assets')));
app.use('/admin/assets', express.static(path.join(ROOT, 'public', 'assets')));

// ==========================================
// JWT AUTH MIDDLEWARE
// ==========================================
function requireAuth(req, res, next) {
  const token = req.cookies?.admin_token;

  if (!token) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ error: 'Non autorisé. Veuillez vous connecter.' });
    }
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.clearCookie('admin_token');
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ error: 'Session expirée. Reconnectez-vous.' });
    }
    res.redirect('/admin/login');
  }
}

// ==========================================
// ADMIN PAGE ROUTES
// ==========================================

app.get('/admin/login', (req, res) => {
  const token = req.cookies?.admin_token;
  if (token) {
    try { jwt.verify(token, JWT_SECRET); return res.redirect('/admin/dashboard'); } catch {}
  }
  res.sendFile(path.join(ROOT, 'admin', 'login.html'));
});

app.get('/admin', (req, res) => {
  const token = req.cookies?.admin_token;
  if (token) {
    try { jwt.verify(token, JWT_SECRET); return res.redirect('/admin/dashboard'); } catch {}
  }
  res.redirect('/admin/login');
});

app.get('/admin/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(ROOT, 'admin', 'admin.html'));
});

// Serve admin static files (CSS/JS) — block direct HTML access
app.use('/admin', (req, res, next) => {
  if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/i.test(req.path)) return next();
  if (req.path === '/admin.html' || req.path === 'admin.html') return res.redirect('/admin/dashboard');
  next();
}, express.static(path.join(ROOT, 'admin')));

// ==========================================
// AUTH API ENDPOINTS
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Nom d'utilisateur et mot de passe requis." });
  }

  // Constant-time compare (prevents timing attacks)
  if (username !== ADMIN_USERNAME) {
    await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!isValid) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  // Sign JWT token (4 hour expiry)
  const token = jwt.sign(
    { isAdmin: true, username },
    JWT_SECRET,
    { expiresIn: '4h' }
  );

  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 4 * 60 * 60 * 1000
  });

  res.json({ success: true, message: 'Connexion réussie. Redirection en cours...' });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true, message: 'Déconnecté avec succès.' });
});

// GET /api/auth/status
app.get('/api/auth/status', (req, res) => {
  const token = req.cookies?.admin_token;
  if (!token) return res.json({ isLoggedIn: false });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ isLoggedIn: true, username: decoded.username });
  } catch {
    res.json({ isLoggedIn: false });
  }
});

// ==========================================
// DATABASE HELPER FUNCTIONS
// ==========================================

async function getConfig(key) {
  try {
    const result = await turso.execute({
      sql: 'SELECT value FROM config WHERE key = ?',
      args: [key]
    });
    if (result.rows.length === 0) return null;
    return JSON.parse(result.rows[0].value);
  } catch { return null; }
}

async function setConfig(key, value) {
  await turso.execute({
    sql: 'INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)',
    args: [key, JSON.stringify(value)]
  });
}

async function getAllProjects() {
  const result = await turso.execute('SELECT * FROM projects ORDER BY created_at DESC');
  return result.rows.map(rowToProject);
}

async function getProjectById(id) {
  const result = await turso.execute({
    sql: 'SELECT * FROM projects WHERE id = ?',
    args: [id]
  });
  return result.rows.length > 0 ? rowToProject(result.rows[0]) : null;
}

function rowToProject(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    categoryLabel: row.categoryLabel,
    shortDesc: row.shortDesc,
    fullDesc: row.fullDesc,
    image: row.image,
    technologies: JSON.parse(row.technologies || '[]'),
    features: JSON.parse(row.features || '[]'),
    demoUrl: row.demoUrl,
    githubUrl: row.githubUrl
  };
}

async function getAllSkills() {
  const result = await turso.execute('SELECT * FROM skills ORDER BY id ASC');
  return result.rows.map(row => ({
    category: row.category,
    categoryTitle: row.categoryTitle,
    icon: row.icon,
    items: JSON.parse(row.items || '[]')
  }));
}

async function getAllMessages() {
  const result = await turso.execute('SELECT * FROM messages ORDER BY created_at DESC');
  return result.rows.map(row => ({
    id: row.id,
    senderName: row.senderName,
    senderEmail: row.senderEmail,
    projectType: row.projectType,
    message: row.message,
    createdAt: row.createdAt
  }));
}

const CATEGORY_LABELS = {
  mobile: 'Dev Mobile',
  web: 'Web App',
  fullstack: 'APIs & Backend',
  dashboards: 'Dashboards'
};

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// GET /api/site-data — Public data for client
app.get('/api/site-data', async (req, res) => {
  try {
    const [hero, stats, theme, contactInfo, projects, skills] = await Promise.all([
      getConfig('hero'),
      getConfig('stats'),
      getConfig('theme'),
      getConfig('contactInfo'),
      getAllProjects(),
      getAllSkills()
    ]);

    res.json({
      theme: theme || 'theme-kupa',
      hero: hero || {},
      stats: stats || [],
      projects,
      skills,
      contactInfo: contactInfo || {}
    });
  } catch (err) {
    console.error('GET /api/site-data error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/messages — Submit contact message
app.post('/api/messages', async (req, res) => {
  const { senderName, senderEmail, projectType, message } = req.body;

  if (!senderName || !senderEmail || !message) {
    return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires.' });
  }

  try {
    const id = 'msg-' + Date.now();
    const createdAt = new Date().toISOString();

    await turso.execute({
      sql: 'INSERT INTO messages (id, senderName, senderEmail, projectType, message, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, senderName, senderEmail, projectType || 'general', message, createdAt]
    });

    res.status(201).json({
      success: true,
      message: 'Message reçu avec succès !',
      data: { id, senderName, senderEmail, projectType, message, createdAt }
    });
  } catch (err) {
    console.error('POST /api/messages error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du message.' });
  }
});

// ==========================================
// ADMIN API ENDPOINTS (ALL PROTECTED)
// ==========================================

// GET /api/admin/data — Full dashboard data
app.get('/api/admin/data', requireAuth, async (req, res) => {
  try {
    const [hero, stats, theme, contactInfo, projects, skills, messages] = await Promise.all([
      getConfig('hero'),
      getConfig('stats'),
      getConfig('theme'),
      getConfig('contactInfo'),
      getAllProjects(),
      getAllSkills(),
      getAllMessages()
    ]);

    res.json({
      theme: theme || 'theme-kupa',
      hero: hero || {},
      stats: stats || [],
      contactInfo: contactInfo || {},
      projects,
      skills,
      messages
    });
  } catch (err) {
    console.error('GET /api/admin/data error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/admin/theme
app.put('/api/admin/theme', requireAuth, async (req, res) => {
  try {
    const { theme } = req.body;
    await setConfig('theme', theme || 'theme-kupa');
    res.json({ success: true, message: 'Thème mis à jour !', theme });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du thème.' });
  }
});

// PUT /api/admin/hero
app.put('/api/admin/hero', requireAuth, async (req, res) => {
  try {
    const { badgeText, title, description, codeSnippet, stats } = req.body;
    const currentHero = await getConfig('hero') || {};

    const newHero = {
      ...currentHero,
      ...(badgeText !== undefined && { badgeText }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(codeSnippet !== undefined && { codeSnippet })
    };

    await setConfig('hero', newHero);
    if (stats && Array.isArray(stats)) await setConfig('stats', stats);

    res.json({ success: true, message: 'Section Hero mise à jour !', hero: newHero });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du hero.' });
  }
});

// PUT /api/admin/contact-info
app.put('/api/admin/contact-info', requireAuth, async (req, res) => {
  try {
    const { email, location, github, linkedin } = req.body;
    const current = await getConfig('contactInfo') || {};

    const contactInfo = {
      email: email || current.email,
      location: location || current.location,
      github: github || current.github,
      linkedin: linkedin || current.linkedin
    };

    await setConfig('contactInfo', contactInfo);
    res.json({ success: true, message: 'Coordonnées mises à jour !', contactInfo });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour des coordonnées.' });
  }
});

// --- PROJECTS CRUD ---

// POST /api/admin/projects
app.post('/api/admin/projects', requireAuth, async (req, res) => {
  try {
    const project = req.body;
    if (!project.title || !project.category) {
      return res.status(400).json({ error: 'Le titre et la catégorie sont requis.' });
    }

    const id = 'proj-' + Date.now();
    const categoryLabel = CATEGORY_LABELS[project.category] || 'Projet';

    await turso.execute({
      sql: `INSERT INTO projects (id, title, category, categoryLabel, shortDesc, fullDesc, image, technologies, features, demoUrl, githubUrl)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, project.title, project.category, categoryLabel,
        project.shortDesc || '', project.fullDesc || '',
        project.image || '/assets/images/loyalty_app.png',
        JSON.stringify(Array.isArray(project.technologies) ? project.technologies : []),
        JSON.stringify(Array.isArray(project.features) ? project.features : []),
        project.demoUrl || '#', project.githubUrl || '#'
      ]
    });

    const newProject = { id, ...project, categoryLabel };
    res.status(201).json({ success: true, message: 'Projet créé avec succès !', project: newProject });
  } catch (err) {
    console.error('POST /api/admin/projects error:', err);
    res.status(500).json({ error: 'Erreur lors de la création du projet.' });
  }
});

// PUT /api/admin/projects/:id
app.put('/api/admin/projects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const categoryLabel = CATEGORY_LABELS[data.category] || 'Projet';

    const result = await turso.execute({
      sql: `UPDATE projects SET
              title = COALESCE(?, title),
              category = COALESCE(?, category),
              categoryLabel = ?,
              shortDesc = COALESCE(?, shortDesc),
              fullDesc = COALESCE(?, fullDesc),
              image = COALESCE(?, image),
              technologies = COALESCE(?, technologies),
              features = COALESCE(?, features),
              demoUrl = COALESCE(?, demoUrl),
              githubUrl = COALESCE(?, githubUrl)
            WHERE id = ?`,
      args: [
        data.title, data.category, categoryLabel,
        data.shortDesc, data.fullDesc, data.image,
        data.technologies ? JSON.stringify(data.technologies) : null,
        data.features ? JSON.stringify(data.features) : null,
        data.demoUrl, data.githubUrl, id
      ]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Projet introuvable.' });
    }

    res.json({ success: true, message: 'Projet mis à jour !' });
  } catch (err) {
    console.error('PUT /api/admin/projects/:id error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du projet.' });
  }
});

// DELETE /api/admin/projects/:id
app.delete('/api/admin/projects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await turso.execute({
      sql: 'DELETE FROM projects WHERE id = ?',
      args: [id]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Projet introuvable.' });
    }

    res.json({ success: true, message: 'Projet supprimé avec succès !' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

// --- SKILLS CRUD ---

// POST /api/admin/skills
app.post('/api/admin/skills', requireAuth, async (req, res) => {
  try {
    const { category, name, level } = req.body;
    if (!category || !name) {
      return res.status(400).json({ error: 'La catégorie et le nom sont requis.' });
    }

    // Get existing category or create new
    const existing = await turso.execute({
      sql: 'SELECT items FROM skills WHERE category = ?',
      args: [category]
    });

    if (existing.rows.length > 0) {
      const items = JSON.parse(existing.rows[0].items || '[]');
      items.push({ name, level: level || 'Maîtrisé' });
      await turso.execute({
        sql: 'UPDATE skills SET items = ? WHERE category = ?',
        args: [JSON.stringify(items), category]
      });
    } else {
      await turso.execute({
        sql: 'INSERT INTO skills (category, categoryTitle, icon, items) VALUES (?, ?, ?, ?)',
        args: [category, category.toUpperCase(), 'fa-code', JSON.stringify([{ name, level: level || 'Maîtrisé' }])]
      });
    }

    const skills = await getAllSkills();
    res.status(201).json({ success: true, message: 'Compétence ajoutée !', skills });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la compétence.' });
  }
});

// DELETE /api/admin/skills/:category/:skillName
app.delete('/api/admin/skills/:category/:skillName', requireAuth, async (req, res) => {
  try {
    const { category, skillName } = req.params;
    const name = decodeURIComponent(skillName);

    const existing = await turso.execute({
      sql: 'SELECT items FROM skills WHERE category = ?',
      args: [category]
    });

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Catégorie introuvable.' });
    }

    const items = JSON.parse(existing.rows[0].items || '[]').filter(i => i.name !== name);
    await turso.execute({
      sql: 'UPDATE skills SET items = ? WHERE category = ?',
      args: [JSON.stringify(items), category]
    });

    const skills = await getAllSkills();
    res.json({ success: true, message: 'Compétence supprimée !', skills });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

// --- MESSAGES ---

// GET /api/admin/messages
app.get('/api/admin/messages', requireAuth, async (req, res) => {
  try {
    res.json(await getAllMessages());
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
  }
});

// DELETE /api/admin/messages/:id
app.delete('/api/admin/messages/:id', requireAuth, async (req, res) => {
  try {
    await turso.execute({
      sql: 'DELETE FROM messages WHERE id = ?',
      args: [req.params.id]
    });
    res.json({ success: true, message: 'Message supprimé !' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du message.' });
  }
});

// ==========================================
// GLOBAL ERROR HANDLER (must be last)
// ==========================================
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: 'Format JSON invalide.' });
  }
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

module.exports = app;
