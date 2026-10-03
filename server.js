const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname, { index: 'home.html' }));

const db = new sqlite3.Database('./users.db', (err) => {
    if (err) console.error('Error connecting to database:', err.message);
    else console.log('Connected to SQLite database (users.db).');
});

// Initialize database schema and migrate employee-specific columns
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT, middleName TEXT, lastName TEXT, email TEXT, phone TEXT, dob TEXT, gender TEXT,
      nationality TEXT, nationalId TEXT, username TEXT, password TEXT, securityQuestion TEXT, securityAnswer TEXT,
      enable2FA INTEGER, street1 TEXT, street2 TEXT, city TEXT, state TEXT, postalCode TEXT, country TEXT,
      occupation TEXT, company TEXT, experience INTEGER, annualIncome REAL, preferredCurrency TEXT,
      techSkillLevel INTEGER, preferredTheme TEXT, bio TEXT, termsAccepted INTEGER,
      department TEXT, employeeId TEXT, status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Ensure extra columns exist if table was created in an older version
    const columnsToAdd = [
        { name: 'department', type: 'TEXT' },
        { name: 'employeeId', type: 'TEXT' },
        { name: 'status', type: "TEXT DEFAULT 'Active'" }
    ];

    columnsToAdd.forEach(col => {
        db.run(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`, (err) => {
            // Error is expected if column already exists
        });
    });
});

// Helper to generate employee registration payload
function handleRegistration(req, res) {
    const data = req.body || {};

    // Auto-generate employee code if missing
    const generatedEmpId = data.nationalId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const department = data.department || (data.occupation ? data.occupation.split(' ')[0] : 'General');
    const status = data.status || 'Active';

    const sql = `
    INSERT INTO users (
      firstName, middleName, lastName, email, phone, dob, gender, nationality, nationalId,
      username, password, securityQuestion, securityAnswer, enable2FA,
      street1, street2, city, state, postalCode, country,
      occupation, company, experience, annualIncome, preferredCurrency,
      techSkillLevel, preferredTheme, bio, termsAccepted,
      department, employeeId, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const params = [
        data.firstName || '',
        data.middleName || '',
        data.lastName || '',
        data.email || '',
        data.phone || '',
        data.dob || '',
        data.gender || '',
        data.nationality || '',
        data.nationalId || '',
        data.username || '',
        data.password || '',
        data.securityQuestion || '',
        data.securityAnswer || '',
        data.enable2FA ? 1 : 0,
        data.street1 || '',
        data.street2 || '',
        data.city || '',
        data.state || '',
        data.postalCode || '',
        data.country || '',
        data.occupation || '',
        data.company || 'NexCorp Industries',
        Number(data.experience) || 0,
        Number(data.annualIncome) || 0,
        data.preferredCurrency || 'USD',
        Number(data.techSkillLevel) || 5,
        data.preferredTheme || 'dark',
        data.bio || '',
        data.termsAccepted ? 1 : 0,
        department,
        generatedEmpId,
        status
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Database Insert Error:', err.message);
            return res.status(500).json({ status: 'error', message: 'Failed to save to database: ' + err.message });
        }

        res.status(201).json({
            status: 'success',
            message: 'Employee successfully registered and saved to database!',
            insertedUserId: this.lastID,
            employeeId: generatedEmpId
        });
    });
}

// 1. Employee Registration Endpoints (supporting both /api/register and /api/v1/register)
app.post('/api/register', handleRegistration);
app.post('/api/v1/register', handleRegistration);

// 2. Employee List Endpoints
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ total: rows.length, users: rows });
    });
});

app.get('/api/employees', (req, res) => {
    db.all('SELECT * FROM users ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ total: rows.length, employees: rows });
    });
});

// 3. Single Employee Endpoint
app.get('/api/employees/:id', (req, res) => {
    db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Employee not found' });
        res.json({ employee: row });
    });
});

// 4. Delete Employee Endpoint
app.delete('/api/employees/:id', (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Employee not found' });
        res.json({ success: true, message: `Employee #${req.params.id} offboarded successfully.` });
    });
});

// 5. Analytics & Dashboard Statistics Endpoint
app.get('/api/stats', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const total = rows.length;
        const departments = new Set();
        let totalExp = 0;
        let with2FA = 0;

        rows.forEach(r => {
            if (r.department) departments.add(r.department);
            else if (r.occupation) departments.add(r.occupation.split(' ')[0]);
            totalExp += (Number(r.experience) || 0);
            if (r.enable2FA) with2FA++;
        });

        res.json({
            totalEmployees: total,
            totalDepartments: departments.size || (total > 0 ? 1 : 0),
            averageExperience: total > 0 ? (totalExp / total).toFixed(1) : 0,
            twoFactorAdoptionRate: total > 0 ? Math.round((with2FA / total) * 100) : 0
        });
    });
});

// 6. Seed Demo Data Endpoint (Convenient for initial preview)
app.post('/api/seed', (req, res) => {
    const sampleEmployees = [
        {
            firstName: 'Sarah', middleName: 'Louise', lastName: 'Connor',
            email: 'sarah.connor@cyberdyne.com', phone: '+1-555-0192', dob: '1990-05-12',
            gender: 'female', nationality: 'US', nationalId: 'EMP-9021',
            username: 'sconnor90', password: 'SecretPassword123!', securityQuestion: 'pet', securityAnswer: 'Max',
            enable2FA: 1, street1: '742 Evergreen Terrace', street2: 'Suite 400', city: 'Springfield',
            state: 'OR', postalCode: '97477', country: 'US',
            occupation: 'Lead Security Engineer', company: 'NexCorp Cyberdyne', experience: 9,
            annualIncome: 145000, preferredCurrency: 'USD', techSkillLevel: 9, preferredTheme: 'dark',
            bio: 'Senior cybersecurity specialist focused on infrastructure resilience and threat intelligence.',
            termsAccepted: 1, department: 'Security', employeeId: 'EMP-9021', status: 'Active'
        },
        {
            firstName: 'John', middleName: 'A.', lastName: 'Doe',
            email: 'john.doe@nexcorp.internal', phone: '+1-555-0144', dob: '1988-11-20',
            gender: 'male', nationality: 'US', nationalId: 'EMP-8834',
            username: 'johndoe', password: 'SecretPassword123!', securityQuestion: 'city', securityAnswer: 'Austin',
            enable2FA: 1, street1: '1204 Market Street', street2: '', city: 'San Francisco',
            state: 'CA', postalCode: '94103', country: 'US',
            occupation: 'Full Stack Architect', company: 'NexCorp Engineering', experience: 8,
            annualIncome: 160000, preferredCurrency: 'USD', techSkillLevel: 10, preferredTheme: 'dark',
            bio: 'Cloud architecture and scalable Node/React microservices engineer.',
            termsAccepted: 1, department: 'Engineering', employeeId: 'EMP-8834', status: 'Active'
        },
        {
            firstName: 'Amara', middleName: 'K.', lastName: 'Vance',
            email: 'amara.vance@nexcorp.internal', phone: '+44-20-7946-0912', dob: '1993-03-14',
            gender: 'female', nationality: 'UK', nationalId: 'EMP-7712',
            username: 'avance', password: 'SecretPassword123!', securityQuestion: 'pet', securityAnswer: 'Barnaby',
            enable2FA: 0, street1: '45 Oxford Circus', street2: 'Flat 12', city: 'London',
            state: 'Greater London', postalCode: 'W1D 1BS', country: 'UK',
            occupation: 'HR Operations Lead', company: 'NexCorp Global', experience: 6,
            annualIncome: 92000, preferredCurrency: 'GBP', techSkillLevel: 7, preferredTheme: 'dark',
            bio: 'People operations specialist leading company onboarding and global talent development.',
            termsAccepted: 1, department: 'Human Resources', employeeId: 'EMP-7712', status: 'Active'
        },
        {
            firstName: 'Marcus', middleName: 'E.', lastName: 'Chen',
            email: 'marcus.chen@nexcorp.internal', phone: '+1-416-555-0188', dob: '1991-08-05',
            gender: 'male', nationality: 'CA', nationalId: 'EMP-6450',
            username: 'mchen', password: 'SecretPassword123!', securityQuestion: 'city', securityAnswer: 'Toronto',
            enable2FA: 1, street1: '88 Bay Street', street2: 'Apt 22B', city: 'Toronto',
            state: 'ON', postalCode: 'M5J 2R8', country: 'CA',
            occupation: 'Financial Analyst', company: 'NexCorp Finance', experience: 5,
            annualIncome: 110000, preferredCurrency: 'USD', techSkillLevel: 8, preferredTheme: 'dark',
            bio: 'Strategic planning, corporate treasury analysis, and equity compensation forecasting.',
            termsAccepted: 1, department: 'Finance', employeeId: 'EMP-6450', status: 'Active'
        }
    ];

    const insertSql = `
      INSERT INTO users (
        firstName, middleName, lastName, email, phone, dob, gender, nationality, nationalId,
        username, password, securityQuestion, securityAnswer, enable2FA,
        street1, street2, city, state, postalCode, country,
        occupation, company, experience, annualIncome, preferredCurrency,
        techSkillLevel, preferredTheme, bio, termsAccepted, department, employeeId, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.serialize(() => {
        sampleEmployees.forEach(emp => {
            db.run(insertSql, [
                emp.firstName, emp.middleName, emp.lastName, emp.email, emp.phone, emp.dob, emp.gender,
                emp.nationality, emp.nationalId, emp.username, emp.password, emp.securityQuestion, emp.securityAnswer,
                emp.enable2FA, emp.street1, emp.street2, emp.city, emp.state, emp.postalCode, emp.country,
                emp.occupation, emp.company, emp.experience, emp.annualIncome, emp.preferredCurrency,
                emp.techSkillLevel, emp.preferredTheme, emp.bio, emp.termsAccepted, emp.department, emp.employeeId, emp.status
            ]);
        });
    });

    res.json({ success: true, message: 'Sample employee records added successfully!' });
});

// Default route fallback to home.html if accessed directly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.listen(PORT, () => console.log(`NexCorp Employee Portal Server running at http://localhost:${PORT}`));