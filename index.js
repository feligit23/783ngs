const express = require("express");
const path = require("path");
const puppeteer = require('puppeteer')
const fs = require("fs");

const PORT = process.env.PORT || 5000;

const app = express();

app.disable('x-powered-by');

app.use(express.json());

app.use("/api/", async (req, res) => {
  function generateID() {
    const ID = new Date().getTime().toString(36);
    return ID;
  };

  console.log(generateID())

  try {
    if (!req.query.url) {
      return res.json({
        error: "URL is required",
      });
    }

    // get token from parameter
    const token = req.query.token;

    // get url parameter
    const url = req.query.url;

    // set screenshot ID & save path
    const ID = generateID();

    console.log(ID)

    // const imageStorage = path.join(
    //   __dirname, + ID + ".png"
    // );

    // launch headless brpwser
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
	  defaultViewport: {
        width:1920,
        height:1080
      }
    });

    // Create a new page
    const page = await browser.newPage();

    // Navigate to some website
    await page.goto(`https://${url}`, {
      waitUntil: "load",
      // Remove the timeoutt
      timeout: 0,
    });

    await page.screenshot({
      path: path.join(
        __dirname, + ID + ".png"
      ), fullPage: true
    });

    await browser.close();

    console.log(`All done, check the screenshots.`)

    return res.sendFile(path.join(
      __dirname, + ID + ".png"
    ));


  } catch (error) {

    res.status(500).json({ erroe: error.message });

  }
});


app.listen(PORT, () => console.log(`Listening on ${PORT}`));
