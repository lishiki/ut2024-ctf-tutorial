const express = require("express");
const { chromium } = require("playwright");

const app = express();
const port = 3000;

const FLAG1 = process.env.FLAG_XSS1;
const FLAG2 = process.env.FLAG_XSS2;
const FLAG3 = process.env.FLAG_XSS3;

// 問題1
app.get("/xss1", (req, res) => {
  const username = req.query.username;

  res.send(`
        <h1>XSS Example</h1>
        <p>Hello, ${username || "guest"}!</p>
        <form method="GET" action="/xss1">
            <input type="text" name="username">
            <button type="submit">Submit</button>
        </form>
    `);
});

// 問題2
app.get("/xss2", (req, res) => {
  let username = req.query.username;
  username = username.replaceAll(/script|on/gi, "");

  res.send(`
        <h1>XSS Example 2</h1>
        <p>Hello, ${username || "guest"}!</p>
        <form method="GET" action="/xss2">
            <input type="text" name="username">
            <button type="submit">Submit</button>
        </form>
    `);
});

// 問題3
app.get("/xss3", (req, res) => {
  const username = req.query.username;

  res.send(`
            <h1>XSS Example 3</h1>
            <p id=output></p>
            <form method="GET" action="/xss3">
                <input type="text" name="username">
                <button type="submit">Submit</button>
            </form>
            <script>
                const username = ${JSON.stringify(username || "guest")};
                document.getElementById("output").innerText = "Hello, " + username + "!";
            </script>
        `);
});

app.get("/validate", (req, res) => {
  if (req.query.url) {
    const url = new URL(req.query.url);
    url.host = "localhost:3000";

    (async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      let is_alert = false;

      page.on("dialog", async (dialog) => {
        if (dialog.type() === "alert") {
          console.log("Alert dialog detected");
          await dialog.accept();
          // Call your function here
          is_alert = true;
        }
      });

      await page.goto(url.href, { timeout: 5000 });
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
        res.send(`<h1>Attack</h1>
        <p>Flag: ${flag}</p>`);
      } else {
        res.send(`<h1>Safe</h1>
        <p>URL is safe</p>`);
      }
    })().catch((error) => {
      console.error(error);
      res.send(`<h1>Error</h1>
        <p>Invalid URL</p>`);
    });
  } else {
    res.send(`
            <h1>Attack</h1>
            <p>Try to steal the flag!</p>
            <form method="GET" action="/validate">
            <input type="text" name="url">
            <button type="submit">Submit</button>
            </form>
            `);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
