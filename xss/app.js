const express = require("express");
const bodyParser = require("body-parser");
const { chromium } = require("playwright");

const app = express();
const port = 3000;

const FLAG1 = process.env.FLAG_XSS1;
const FLAG2 = process.env.FLAG_XSS2;
const FLAG3 = process.env.FLAG_XSS3;

const t = (s) => `<!DOCTYPE html>
<html>
<head>
<title>XSS</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/holiday.css@0.11.2" />
</head>
<body>
${s}
</body>
</html>
`;

app.use(bodyParser.urlencoded());
// 問題1
app.get("/xss1", (req, res) => {
  const username = req.query.username;

  res.send(
    t(`
    <h1>XSS 1</h1>
    <p>Hello, ${username || "guest"}!</p>
    <form method="GET" action="/xss1">
        <input type="text" name="username" placeholder="Enter your name">
        <p><button type="submit">Submit</button></p>
    </form>
  `)
  );
});

// 問題2
app.get("/xss2", (req, res) => {
  let username = req.query.username;
  if (username) username = username.replace(/script|on/gi, "");

  res.send(
    t(`
        <h1>XSS 2</h1>
        <p>Hello, ${username || "guest"}!</p>
        <form method="GET" action="/xss2">
            <input type="text" name="username" placeholder="Enter your name">
            <p><button type="submit">Submit</button></p>
        </form>
    `)
  );
});

// 問題3
app.get("/xss3", (req, res) => {
  const username = req.query.username;

  res.send(
    t(`
        <h1>XSS 3</h1>
        <p id=output></p>
        <form method="GET" action="/xss3">
            <input type="text" name="username" placeholder="Enter your name">
            <p><button type="submit">Submit</button></p>
        </form>
        <script>
            const username = ${JSON.stringify(username || "guest")};
            document.getElementById("output").innerText = "Hello, " + username + "!";
        </script>
    `)
  );
});

app.get("/validate", (req, res) => {
  const url = (req.query.url || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  res.send(
    t(`
        <h1>Validate XSS</h1>
        <p>Submit a URL trigger an alert dialog</p>
        <form method="POST" action="/validate">
        <input type="text" name="url" value="${url}" placeholder="Enter URL">
        <p><button type="submit">Submit</button></p>
        </form>
  `)
  );
});

app.post("/validate", (req, res) => {
  if (req.body.url) {
    const url = new URL(req.body.url);
    url.host = "localhost:3000";

    (async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      let is_alert = false;

      page.on("dialog", async (dialog) => {
        await dialog.accept();
        if (dialog.type() === "alert") {
          console.log("Alert dialog detected");
          is_alert = true;
        }
      });

      await page.goto(url.href, { timeout: 3000 });
      await browser.close();

      if (is_alert) {
        const flag =
          url.pathname == "/xss1"
            ? FLAG1
            : url.pathname == "/xss2"
            ? FLAG2
            : url.pathname == "/xss3"
            ? FLAG3
            : null;
        res.send(
          t(`
                <h1>XSS Succeeded on ${url.pathname}</h1>
                <p>Flag: <code>${flag}</code></p>
            `)
        );
      } else {
        res.send(
          t(`
                <h1>Safe</h1>
                <p>URL is safe</p>
            `)
        );
      }
    })().catch((error) => {
      console.error(error);
      res.send(
        t(`
            <h1>Error</h1>
            <p>Invalid URL</p>
          `)
      );
    });
  } else {
    res.send(
      t(`
        <h1>Error</h1>
        <p>URL is required</p>
        `)
    );
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
