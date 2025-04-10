const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // Launch browser in non-headless mode for debugging
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navigating to Hacker News newest page...");

    // Set a navigation timeout to avoid indefinite hanging
    context.setDefaultNavigationTimeout(30000);

    // Attempt navigation to the target URL
    await page.goto("https://news.ycombinator.com/newest", { waitUntil: "domcontentloaded" });

    // Check if the page is still stuck at about:blank
    if (page.url() === "about:blank") {
      throw new Error("Navigation failed: still on about:blank");
    }

    console.log(`Successfully navigated to ${page.url()}`);

    // Wait explicitly for articles to load
    await page.waitForSelector(".athing", { timeout: 10000 });
    console.log("Articles detected on the page.");

    let articles = [];

    // Loop until we collect at least 100 unique articles
    while (articles.length < 100) {
      const newArticles = await page.$$eval(".athing", (rows) =>
        rows.map((row) => {
          const titleElem = row.querySelector(".titleline > a");
          const title = titleElem ? titleElem.innerText : "No Title";
          const ageElement = row.nextElementSibling ? row.nextElementSibling.querySelector(".age > a") : null;
          const age = ageElement ? ageElement.innerText : "Unknown";
          return { title, age };
        })
      );

      // Add only unique articles based on their title
      const currentTitles = new Set(articles.map((a) => a.title));
      newArticles.forEach((article) => {
        if (!currentTitles.has(article.title)) {
          articles.push(article);
        }
      });

      console.log(`Collected ${articles.length} unique articles so far.`);

      // Stop if we have collected at least 100 articles
      if (articles.length >= 100) break;

      // Find and click the "More" button
      const moreButton = await page.$("a.morelink");
      if (!moreButton) {
        console.log("No more articles available.");
        break;
      }

      // Click the "More" button and wait for new content to load
      await moreButton.click();
      await page.waitForSelector(".athing", { timeout: 10000 });
    }

    // Use only the first 100 articles
    const first100 = articles.slice(0, 100);
    console.log("First 100 articles collected:");
    console.log(first100);

    // Helper function to convert an age string into minutes.
    // For example, "10 minutes ago" becomes 10, "1 hour ago" becomes 60, "1 day ago" becomes 1440.
    function parseAge(ageStr) {
      if (ageStr === "Unknown") return Infinity;
      const parts = ageStr.split(" ");
      const num = parseInt(parts[0], 10);
      if (isNaN(num)) return Infinity;
      if (ageStr.includes("minute")) {
        return num;
      } else if (ageStr.includes("hour")) {
        return num * 60;
      } else if (ageStr.includes("day")) {
        return num * 1440;
      }
      return num;
    }

    // Validate that the 100 articles are sorted from newest to oldest.
    // Newer articles will have a lower number of minutes elapsed.
    let isSorted = true;
    for (let i = 1; i < first100.length; i++) {
      if (parseAge(first100[i - 1].age) > parseAge(first100[i].age)) {
        isSorted = false;
        break;
      }
    }

    if (isSorted) {
      console.log("✅ Articles are sorted from newest to oldest.");
    } else {
      console.log("❌ Articles are NOT sorted correctly.");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

// Run the function
sortHackerNewsArticles().catch((err) => console.error("Error:", err));
