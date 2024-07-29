const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const port = 3000;

// Middleware to handle CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

// Proxy endpoint to fetch and modify content
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send("Missing url parameter");
  }

  try {
    const response = await axios.get(targetUrl);
    const html = response.data;

    // Load HTML into Cheerio
    const $ = cheerio.load(html);

    // Inject custom styles
    $("head").append(
      "<style>.example { color: blue; font-size: 25px; }</style>",
    );

    // Modify content as needed (example: adding a class)
    $(".example").addClass("custom-style");

    // Send modified HTML back
    res.send($.html());
  } catch (error) {
    res.status(500).send("Error fetching the target URL");
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
