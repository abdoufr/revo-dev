/**
 * Local development entry point.
 * For Vercel, api/index.js is used directly.
 */

const app = require('./api/index.js');

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log('=================================================');
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`🌐 Site Public      : http://localhost:${PORT}/`);
  console.log(`🔐 Panneau Admin   : http://localhost:${PORT}/admin`);
  console.log(`🔑 Connexion Admin : http://localhost:${PORT}/admin/login`);
  console.log('=================================================');
  console.log(`👤 Username : ${process.env.ADMIN_USERNAME || 'admin'}`);
  console.log(`🔒 Password : Admin@2026!`);
  console.log(`🗄️  Database : ${process.env.TURSO_DATABASE_URL || 'file:local.db (SQLite local)'}`);
  console.log('=================================================');
});
