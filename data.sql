CREATE DATABASE temp_email_logs;
USE temp_email_logs;

CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip VARCHAR(45),
    sid_token VARCHAR(255),
    website_visited TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
