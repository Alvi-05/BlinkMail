const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.set("view engine", "ejs"); // Use EJS for admin panel
app.use(express.static("public")); // Serve static files

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "temp_email_logs"
});

db.connect(err => {
    if (err) {
        console.error("MySQL connection failed:", err);
        return;
    }
    console.log("Connected to MySQL");
});

// Endpoint to log user IPs
app.get("/generate-email", (req, res) => {
    const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const email = `user${Math.floor(Math.random() * 10000)}@tempmail.com`;

    // Insert into MySQL
    db.query("INSERT INTO logs (email, ip) VALUES (?, ?)", [email, userIP], (err) => {
        if (err) console.error("Database error:", err);
    });

    res.json({ email });
});

// Admin Dashboard Route
app.get("/admin", (req, res) => {
    db.query("SELECT * FROM logs ORDER BY created_at DESC", (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Database error");
        }
        res.render("admin", { logs: results });
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
