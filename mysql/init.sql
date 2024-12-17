CREATE DATABASE IF NOT EXISTS sqli;
CREATE DATABASE IF NOT EXISTS sqli2;
CREATE DATABASE IF NOT EXISTS scoreboard;

CREATE USER 'sqli'@'%' IDENTIFIED WITH mysql_native_password BY 'sqli';
CREATE USER 'sqli2'@'%' IDENTIFIED WITH mysql_native_password BY 'sqli2';
CREATE USER 'scoreboard'@'%' IDENTIFIED WITH mysql_native_password BY 'scoreboard';

GRANT ALL PRIVILEGES ON sqli.* TO 'sqli'@'%';
GRANT ALL PRIVILEGES ON sqli2.* TO 'sqli2'@'%';
GRANT ALL PRIVILEGES ON scoreboard.* TO 'scoreboard'@'%';

USE scoreboard;

CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(20) NOT NULL UNIQUE,
     experienced BOOLEAN NOT NULL DEFAULT 0,
     offline BOOLEAN NOT NULL DEFAULT 0,
     token VARCHAR(40) NOT NULL
);

CREATE TABLE solves (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     challenge_id INT NOT NULL,
     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE KEY unique_user_challenge (user_id, challenge_id),
     FOREIGN KEY (user_id) REFERENCES users(id)
);