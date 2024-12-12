const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
const db = mysql.createConnection({
  host: "mysql",
  user: "sqli",
  password: "sqli",
  database: "sqli",
});
const db2 = mysql.createConnection({
  host: "mysql",
  user: "sqli2",
  password: "sqli2",
  database: "sqli2",
});

app.use(bodyParser.urlencoded());
app.use(express.static("public"));

const FLAG1 = process.env.FLAG_SQLI1;
const FLAG2 = process.env.FLAG_SQLI2;
const FLAG3 = process.env.FLAG_SQLI3;

// データベースのセットアップ
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to sqli1 database");
  db.query(
    "CREATE TABLE IF NOT EXISTS users (username VARCHAR(255), password VARCHAR(255))",
    (err) => {
      if (err) throw err;
      db.query(
        "SELECT * FROM users WHERE username = 'admin'",
        (err, results) => {
          if (err) throw err;
          if (results.length === 0) {
            db.query(
              `INSERT INTO users (username, password) VALUES ('admin', '${FLAG2}')`
            );
          }
        }
      );
    }
  );
});

db2.connect((err) => {
  if (err) throw err;
  console.log("Connected to sqli2 database");

  db2.query(
    "CREATE TABLE IF NOT EXISTS users (username VARCHAR(255), password VARCHAR(255))",
    (err) => {
      if (err) throw err;
      db2.query(
        "SELECT * FROM users WHERE username = 'admin'",
        (err, results) => {
          if (err) throw err;
          if (results.length === 0) {
            db2.query(
              `INSERT INTO users (username, password) VALUES ('admin', '${FLAG3}')`
            );
          }
        }
      );
    }
  );
});

// ログインエンドポイント
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  console.log("Executing query:", query);

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Server error");
    } else if (results.length > 0) {
      res.send("Login successful!" + FLAG1);
    } else {
      res.send("Login failed");
    }
  });
});

app.post("/login2", (req, res) => {
  // single quote 絶対ゆるさない
  const username = req.body.username.replace(/'/g, "");
  const password = req.body.password.replace(/'/g, "");

  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  console.log("Executing query:", query);

  db2.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Server error");
    } else if (results.length > 0) {
      res.send("Login successful!" + FLAG3);
    } else {
      res.send("Login failed");
    }
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
