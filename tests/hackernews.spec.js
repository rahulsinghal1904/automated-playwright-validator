const { test, expect } = require('@playwright/test');

// Helper function to convert an age string into minutes.
function parseAge(ageStr) {
  if (ageStr === 'Unknown') return Infinity;
  const parts = ageStr.split(' ');
  const num = parseInt(parts[0], 10);
  if (isNaN(num)) return Infinity;
  if (ageStr.includes('minute')) return num;
  if (ageStr.includes('hour')) return num * 60;
  if (ageStr.includes('day')) return num * 1440;
  return num;
}

test('Validate Hacker News Articles Sorting (first 100 articles)', async ({ page }) => {
  // Navigate to Hacker News "newest" page
  await page.goto('https://news.ycombinator.com/newest', { waitUntil: 'load' });

  // Collect articles until we have 100 unique entries.
  let articles = [];

  while (articles.length < 100) {
    // Extract article titles and ages from the current page
    const newArticles = await page.$$eval('.athing', (rows) =>
      rows.map(row => {
        const titleElem = row.querySelector('.titleline > a');
        const title = titleElem ? titleElem.innerText : 'No Title';
        const ageElement = row.nextElementSibling ? row.nextElementSibling.querySelector('.age > a') : null;
        const age = ageElement ? ageElement.innerText : 'Unknown';
        return { title, age };
      })
    );

    // Add only unique articles based on their title and age
    newArticles.forEach(article => {
      const uniqueKey = `${article.title}-${article.age}`;
      if (!articles.find(a => `${a.title}-${a.age}` === uniqueKey)) {
        articles.push(article);
      }
    });

    //console.log(`Collected ${articles.length} articles so far...`);

    // Stop if we have collected at least 100 articles.
    if (articles.length >= 100) break;

    // Find and click the "More" button.
    const moreButton = await page.$('a.morelink');
    if (!moreButton) {
      console.warn('More button not found — exiting early');
      break;
    }

    // Wait for navigation after clicking the More link
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }),
      moreButton.click()
    ]);
  }

  // Use only the first 100 articles.
  const first100 = articles.slice(0, 100);
  
  // Validate that the articles are sorted from newest to oldest.
  let isSorted = true;
  for (let i = 1; i < first100.length; i++) {
    if (parseAge(first100[i - 1].age) > parseAge(first100[i].age)) {
      isSorted = false;
      break;
    }
  }

  expect(isSorted).toBeTruthy();
});
