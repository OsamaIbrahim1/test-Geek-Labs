import puppeteer from "puppeteer";

// * List of Twitter accounts to scrape
const twitterAccounts = [
  "https://twitter.com/Mr_Derivatives",
  "https://twitter.com/warrior_0719",
  "https://twitter.com/ChartingProdigy",
  "https://twitter.com/allstarcharts",
  "https://twitter.com/yuriymatso",
  "https://twitter.com/TriggerTrades",
  "https://twitter.com/AdamMancini4",
  "https://twitter.com/CordovaTrades",
  "https://twitter.com/Barchart",
  "https://twitter.com/RoyLMattox",
];

// * Input parameters
// * Stock symbol to search for
const tickerToLookFor = "$TSLA";

// * Interval in minutes
const scrapeIntervalMinutes = 15;

// * Function to scrape a Twitter account for stock mentions
async function scrapeTwitterAccount(page, url, ticker) {
  await page.goto(url, { waitUntil: "networkidle2" });

  try {
    // * Wait for tweets to load
    await page.waitForSelector("article", { timeout: 5000 });

    // * Scrape tweets containing the ticker symbol
    const tickerCount = await page.evaluate((ticker) => {
      const tweets = Array.from(document.querySelectorAll("article"));
      let count = 0;
      tweets.forEach((tweet) => {
        if (tweet.innerText.includes(ticker)) {
          count++;
        }
      });
      return count;
    }, ticker);

    return tickerCount;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return 0;
  }
}

// * Function to perform the scraping task for all accounts
async function scrapeAllAccounts() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let totalMentions = 0;

  for (let account of twitterAccounts) {
    const mentions = await scrapeTwitterAccount(page, account, tickerToLookFor);
    totalMentions += mentions;
  }

  console.log(
    `"${tickerToLookFor}" was mentioned "${totalMentions}" times in the last "${scrapeIntervalMinutes}" minutes.`
  );

  await browser.close();
}

// * Set up an interval to run the scraping function
setInterval(scrapeAllAccounts, scrapeIntervalMinutes * 60 * 1000);

// * Run the scraper for the first time immediately
scrapeAllAccounts();
