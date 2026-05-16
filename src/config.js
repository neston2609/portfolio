require('dotenv').config();
const path = require('path');

const config = {
  port: Number(process.env.PORT || 3000),
  env: process.env.NODE_ENV || 'development',
  rootDomain: (process.env.ROOT_DOMAIN || 'rasikawan.com').toLowerCase(),
  devForceSubdomain: process.env.DEV_FORCE_SUBDOMAIN || null,
  sessionSecret: process.env.SESSION_SECRET || 'dev-insecure-secret',
  sessionCookieDomain: process.env.SESSION_COOKIE_DOMAIN || undefined,
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB || 20) * 1024 * 1024,
  youtubeApiKey: process.env.YOUTUBE_API_KEY || null,
  pg: {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  },
  themesDir: path.resolve(__dirname, 'themes'),
  uploadedThemesDir: path.resolve(__dirname, 'themes', '_uploaded'),
  adminDistDir: path.resolve(__dirname, '..', 'admin', 'dist'),
};

module.exports = config;
