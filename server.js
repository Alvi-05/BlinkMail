const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON body requests

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",      // Change if needed
    password: "root",      // Your MySQL password
    database: "temp_email_logs"
});

db.connect(err => {
    if (err) {
        console.error("MySQL connection failed:", err);
        return;
    }
    console.log("Connected to MySQL");
});

// Endpoint to generate a temporary email and log the user's IP
app.get("/generate-email", (req, res) => {
    const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const tempEmail = `user${Date.now()}@tempmail.com`;

    // Insert email and IP into MySQL
    db.query("INSERT INTO logs (ip, email) VALUES (?, ?)", [userIP, tempEmail], (err) => {
        if (err) console.error("Database error:", err);
    });

    res.json({ email: tempEmail });
});

// Endpoint to log website visits using the temporary email
app.post("/log-visit", (req, res) => {
    const { email, website } = req.body;

    if (!email || !website) {
        return res.status(400).json({ error: "Email and website URL are required" });
    }

    db.query("INSERT INTO logs (email, website_visited) VALUES (?, ?)", [email, website], (err) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Visit logged successfully" });
    });
});

// Endpoint to fetch logged website visits for the admin panel
app.get("/admin/logs", (req, res) => {
    db.query("SELECT * FROM logs ORDER BY timestamp DESC", (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});
/*
app.get("/admin", (req, res) => {
    db.query("SELECT * FROM logs ORDER BY created_at DESC", (err, results) => {
        if (err) {
            console.error("Database error:", err);
            res.status(500).send("Error retrieving logs");
            return;
        }
        res.render("server", { logs: results });  // Ensure this file is named 'server.ejs'
    });
});
 */

app.listen(3000, () => console.log("Server running on port 3000"));


//node server.js
//http://127.0.0.1:3000/admin
//http://localhost:3000/admin/logs
