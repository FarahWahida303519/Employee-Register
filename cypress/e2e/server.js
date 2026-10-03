const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serves index.html, styles.css, script.js

// 1. Connect to SQLite Database (Creates 'users.db' file if it doesn't exist)
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database (users.db).');
    }
});

// 2. Create Table for 30 Fields
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      middleName TEXT,
      lastName TEXT,
      email TEXT,
      phone TEXT,
      dob TEXT,
      gender TEXT,
      nationality TEXT,
      nationalId TEXT,
      username TEXT,
      password TEXT,
      securityQuestion TEXT,
      securityAnswer TEXT,
      enable2FA INTEGER,
      street1 TEXT,
      street2 TEXT,
      city TEXT,
      state TEXT,
      postalCode TEXT,
      country TEXT,
      occupation TEXT,
      company TEXT,
      experience INTEGER,
      annualIncome REAL,
      preferredCurrency TEXT,
      techSkillLevel INTEGER,
      preferredTheme TEXT,
      bio TEXT,
      termsAccepted INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// 3. POST Route - Save Form Data to Database
app.post('/api/register', (req, res) => {
    const data = req.body;

    const sql = `
    INSERT INTO users (
      firstName, middleName, lastName, email, phone, dob, gender, nationality, nationalId,
      username, password, securityQuestion, securityAnswer, enable2FA,
      street1, street2, city, state, postalCode, country,
      occupation, company, experience, annualIncome, preferredCurrency,
      techSkillLevel, preferredTheme, bio, termsAccepted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const params = [
        data.firstName, data.middleName, data.lastName, data.email, data.phone, data.dob, data.gender, data.nationality, data.nationalId,
        data.username, data.password, data.securityQuestion, data.securityAnswer, data.enable2FA ? 1 : 0,
        data.street1, data.street2, data.city, data.state, data.postalCode, data.country,
        data.occupation, data.company, data.experience, data.annualIncome, data.preferredCurrency,
        data.techSkillLevel, data.preferredTheme, data.bio, data.termsAccepted ? 1 : 0
    ];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Database Insert Error:', err.message);
            return res.status(500).json({ status: 'error', message: 'Failed to save to database.' });
        }

        res.status(201).json({
            status: 'success',
            message: 'User successfully registered and saved to database!',
            insertedUserId: this.lastID
        });
    });
});

// 4. GET Route - Retrieve Saved Users (Great for Cypress API assertions)
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ total: rows.length, users: rows });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});