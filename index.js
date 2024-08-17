const express = require("express");
const puppeteer = require("puppeteer");
const customHeadContent = require("./custom-head-content");

// const customHeadContent = `
//         <meta charset="UTF-8" />
//         <link rel="icon" href="data:image/x-icon;base64,AA">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
//         <meta name="theme-color" media="(prefers-color-scheme: light)" content="#FFFFFF" />
//         <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#15161A" />
//         <link rel="preconnect" href="https://fonts.googleapis.com">
//         <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//         <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@500&family=Inter:wght@500&display=block" rel="stylesheet">
//         <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
//         <meta property="og:type" content="website"></meta>
//         <meta property="og:url" content="https://okashi.dev/playground/bjqtmihlivpwmqapaxdpplguyxzb"></meta>
//         <meta property="og:title" content="Okashi"></meta>
//         <meta property="og:description" content="The most delicious smart contract playground."></meta>
//         <meta name="twitter:title" content="Okashi"></meta>
//         <meta name="twitter:card" content="summary_large_image"></meta>
//         <meta name="twitter:site" content="@Okashidev"></meta>
//         <meta name="twitter:description" content="The most delicious smart contract playground."></meta>
//         <meta property="og:image" content="https://okashi.dev/v1/social/project/bjqtmihlivpwmqapaxdpplguyxzb/image.1722211117589.png"></meta>
//         <meta name="twitter:image" content="https://okashi.dev/v1/social/project/bjqtmihlivpwmqapaxdpplguyxzb/image.1722211117589.png"></meta>
//         <style>
//           :root {
//             font-family: 'Inter', sans-serif;
//             font-size: 15px;
//             font-weight: 500;
//             font-synthesis: none;
//             text-rendering: optimizeLegibility;
//             -webkit-font-smoothing: antialiased;
//             -moz-osx-font-smoothing: grayscale;
//             -webkit-text-size-adjust: 100%;
//           }
//           html, body, #root {
//             margin: 0;
//             height: 100%;
//           }
//           @media (prefers-color-scheme: light) {
//               #root {
//                 background-color: #FFFFFF;
//               }
//           }
//           @media (prefers-color-scheme: dark) {
//               #root {
//                 background-color: #15161A;
//               }
//           }
//         </style>
//         <title>Okashi</title>
//         <script type="module" crossorigin src="https://okashi.dev/assets/index-ccfcb849.js"></script>
//       `;

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

// Proxy endpoint to fetch and modify content
app.get("/playground/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send("Missing url parameter");
  }

  const targetUrl = `https://okashi.dev/playground/${id}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    console.log({
      // customHeadContent,
      targetUrl,
    });

    // Intercept network requests to allow all resources
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      // Allow all types of requests (e.g., images, CSS, JS, etc.)
      request.continue();
    });

    await page.goto(targetUrl, { waitUntil: "networkidle2" });

    // Inject custom styles and the provided head section
    await page.evaluate((headContent) => {
      const head = document.head;

      // Append the custom head content
      const customHead = document.createElement("div");
      customHead.innerHTML = headContent;
      Array.from(customHead.children).forEach((child) =>
        head.appendChild(child),
      );

      // Inject additional custom styles
      const style = document.createElement("style");
      style.textContent = `
        header {
          display: none!important;
        }

        #root,
        .css-b1m8i1,
        #root + div + div {
          background: transparent!important;
          background-color: transparent!important;
        }


        /* Target the second item with class .css-12591ts */
        .css-12591ts:nth-of-type(2) {
          display: none;
        }

        .css-wyxiyr {
          display: none!important;
        }

        .css-1pspap0 {
          margin: unset!important;
        }

        .css-nzy3yr{
          padding: unset!important;
        }

        .css-12591ts{
          border-radius: unset!important;
        }
      `;
      head.appendChild(style);
    }, customHeadContent);

    // Extract the modified HTML content
    const content = await page.content();

    await browser.close();

    // Send modified HTML back
    res.send(content);
  } catch (error) {
    console.error("Error fetching the target URL:", error);
    res.status(500).send("Error fetching the target URL");
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
