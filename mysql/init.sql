CREATE DATABASE IF NOT EXISTS sqli;
CREATE DATABASE IF NOT EXISTS sqli2;

CREATE USER 'sqli'@'%' IDENTIFIED WITH mysql_native_password BY 'sqli';
CREATE USER 'sqli2'@'%' IDENTIFIED WITH mysql_native_password BY 'sqli2';
GRANT ALL PRIVILEGES ON sqli.* TO 'sqli'@'%';
GRANT ALL PRIVILEGES ON sqli2.* TO 'sqli2'@'%';