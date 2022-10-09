const express = require("express");
const path = require("path");
const puppeteer = require('puppeteer')
const fs = require("fs");
const sys = require('sys')
const exec = require('child_process').exec;
const cron = require('node-cron');

function puts(error, stdout, stderr) { sys.puts(stdout) }


const PORT = process.env.PORT || 5000;

const app = express();

app.disable('x-powered-by');

app.use(express.json());

cron.schedule('10 * * * *', () => {
  console.log('running a task every minute');
  exec("ping -c 3 localhost", puts);
});

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
	   ignoreDefaultArgs: ["--disable-extensions"]
    });

    // Create a new page
    const page = await browser.newPage();

    // Navigate to some website
    await page.goto(`https://${url}`, {
      waitUntil: "load",
      // Remove the timeoutt
      timeout: 0,
    });
	
await page.setViewport({
    width: 1920,
    height: 1080
})


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
