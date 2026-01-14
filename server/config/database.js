import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dataDir = join(__dirname, '..', 'data');
const dbPath = join(dataDir, 'hudt.db');

// Ensure data directory exists
try {
  mkdirSync(dataDir, { recursive: true });
} catch (e) {
  // Directory already exists
}

let db = null;

// Initialize the database
export async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref_number TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      level TEXT NOT NULL,
      talents TEXT NOT NULL,
      instruments TEXT,
      other_talent TEXT,
      previous_experience TEXT NOT NULL,
      experience_details TEXT,
      motivation TEXT NOT NULL,
      hopes_to_gain TEXT,
      availability TEXT NOT NULL,
      audition_slot TEXT,
      status TEXT DEFAULT 'Submitted',
      admin_notes TEXT,
      rating INTEGER DEFAULT 0,
      tags TEXT,
      submitted_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      status_history TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT NOT NULL,
      last_login TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      status TEXT DEFAULT 'sent'
    )
  `);

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_applications_ref_number ON applications(ref_number)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_applications_phone ON applications(phone)`);

  // Check if default admin exists - use env vars for production
  const adminResult = db.exec(`SELECT id FROM admins WHERE username = 'admin'`);
  if (adminResult.length === 0 || adminResult[0].values.length === 0) {
    // Use environment variables or defaults
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'hudt2026admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hudtplatform.com';

    const passwordHash = bcrypt.hashSync(adminPassword, 10);
    const now = new Date().toISOString();
    db.run(`
      INSERT INTO admins (username, password_hash, email, role, created_at)
      VALUES (?, ?, ?, ?, ?)
    `, [adminUsername, passwordHash, adminEmail, 'super_admin', now]);
    console.log(`✅ Default admin created: ${adminUsername}`);
    console.log('   (Set ADMIN_PASSWORD env var to change password)');
  }

  // Save database
  saveDatabase();

  return db;
}

// Save database to file
export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

// Get the database instance
export function getDb() {
  return db;
}

// Database query helpers
export function runQuery(sql, params = []) {
  try {
    db.run(sql, params);
    saveDatabase();
    return { changes: db.getRowsModified(), lastInsertRowid: getLastInsertRowId() };
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

export function getOne(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

export function getAll(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

function getLastInsertRowId() {
  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0] || 0;
}

export default { initDatabase, getDb, runQuery, getOne, getAll, saveDatabase };
