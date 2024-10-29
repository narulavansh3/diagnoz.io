import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// Create a new database instance in memory
const db = new sqlite3.Database(':memory:');

// Promisify database methods
const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

// Initialize database tables
const initDb = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS radiologists (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE,
      name TEXT,
      qualification TEXT,
      specialization TEXT,
      license_number TEXT UNIQUE,
      experience INTEGER,
      phone TEXT,
      is_available BOOLEAN DEFAULT 0,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
      specialties TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS centers (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE,
      name TEXT,
      address TEXT,
      phone TEXT,
      license TEXT UNIQUE,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      patient_name TEXT,
      patient_age INTEGER,
      modality TEXT,
      image_url TEXT,
      clinical_history TEXT,
      status TEXT,
      priority TEXT,
      creator_id TEXT,
      assignee_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users (id),
      FOREIGN KEY (assignee_id) REFERENCES users (id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      findings TEXT,
      impression TEXT,
      case_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases (id)
    )
  `);
};

// Initialize the database
initDb().catch(console.error);

// Export database methods
export default {
  async query(sql, params = []) {
    return all.call(db, sql, params);
  },
  
  async get(sql, params = []) {
    return get.call(db, sql, params);
  },
  
  async run(sql, params = []) {
    return run.call(db, sql, params);
  },

  async transaction(callback) {
    await run('BEGIN TRANSACTION');
    try {
      await callback();
      await run('COMMIT');
    } catch (error) {
      await run('ROLLBACK');
      throw error;
    }
  }
};