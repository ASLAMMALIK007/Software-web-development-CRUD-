const express = require('express');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Corrected require statement

app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'webappdb'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

// Endpoint to fetch users
app.get('/fetch-users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching users:', error);
            res.status(500).send({ error: 'Error fetching users' });
        } else {
            res.json(results);
        }
    });
});

// Endpoint to update a user
app.post('/update-user', (req, res) => {
    const { userId, username, role } = req.body;
    const updateQuery = 'UPDATE users SET username =?, role =? WHERE id =?';
    db.query(updateQuery, [username, role, userId], (error, results) => {
        if (error) {
            console.error('Error updating user:', error);
            res.status(500).send({ error: 'Error updating user' });
        } else {
            res.json({ message: 'User updated successfully' });
        }
    });
});

// Endpoint to delete a user
app.post('/delete-user', (req, res) => {
    const { userId } = req.body;
    const deleteQuery = 'DELETE FROM users WHERE id =?';
    db.query(deleteQuery, [userId], (error, results) => {
        if (error) {
            console.error('Error deleting user:', error);
            res.status(500).send({ error: 'Error deleting user' });
        } else {
            res.json({ message: 'User deleted successfully' });
        }
    });
});

// Serve static files from the "public" directory
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// User registration
app.post('/register', (req, res) => {
    const { username, password, role = 'user' } = req.body;
    const user = { username, password, role };
    db.query('INSERT INTO users SET?', user, (error, results) => {
        if (error) {
            res.status(400).send({ code: 400, failed: 'error occurred', error });
        } else {
            res.status(200).send({ code: 200, success: 'user registered successfully' });
        }
    });
});

// User login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username =?', [username], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            res.status(500).send({ error: 'Database error' });
        } else if (results.length > 0) {
            if (bcrypt.compareSync(password, results[0].password)) { // Corrected typo here
                res.status(200).send({ code: 200, success: 'Login successful', role: results[0].role });
            } else {
                // Send back an error message for incorrect credentials
                res.status(401).send({ error: 'Incorrect username or password' });
            }
        } else {
            // Send back an error message for user not found
            res.status(404).send({ error: 'User not found' });
        }
    });
});

// Route to display all users
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (error, results) => {
        if (error) {
            res.status(500).send({ code: 500, failed: 'error occurred', error });
        } else {
            res.status(200).send({ code: 200, users: results });
        }
    });
});
