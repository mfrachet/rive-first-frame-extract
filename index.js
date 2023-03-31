const puppeteer = require("puppeteer");
const fs = require("fs");
const { clearInterval } = require("timers");

const ping = async (page) => {
  let i = 0;
  let intervalId;

  return new Promise((resolve, reject) => {
    intervalId = setInterval(async () => {
      const result = await page.evaluate(() => window.RIVE_READY);
      if (result) return resolve();

      i++;

      if (i >= 10) {
        clearInterval(intervalId);
        return reject(new Error("Not ready"));
      }
    }, 100);
  }).finally(() => {
    clearInterval(intervalId);
  });
};

const run = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await ping(page);

  // Get the canvas element
  const canvas = await page.$("canvas");
  const frame = await page.evaluate((canvas) => canvas.toDataURL(), canvas);

  const base64Data = frame.replace(/^data:image\/png;base64,/, "");
  const binaryData = Buffer.from(base64Data, "base64");
  fs.writeFileSync("image.png", binaryData);

  await browser.close();
};

run();
