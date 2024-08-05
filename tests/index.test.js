const { test, expect, chromium } = require('@playwright/test');
const { MainPage } = require('../logic/MainPage');

// Utility function to parse date strings into Date objects
function parseDate(dateString) {
    return new Date(dateString);
}

test.describe('Hacker News Article Sorting Tests', () => {
    let browser;
    let page;
    let mainPage;

    test.beforeEach(async () => {
        browser = await chromium.launch({ headless: false });
        page = await browser.newPage();
        mainPage = new MainPage(page);

        // Go to Hacker News
        await page.goto('https://news.ycombinator.com/newest');
    });

    test.afterEach(async () => {
        await browser.close();
    });

    test('Validate articles are sorted from newest to oldest', async () => {
        // Load 100 articles
        const articles = await mainPage.loadMoreArticles(100);

        // Convert article timestamps to Date objects
        const timestamps = articles.map(dateString => parseDate(dateString));

        // Check if timestamps are sorted from newest to oldest
        let isSorted = true;
        for (let i = 0; i < timestamps.length - 1; i++) {
            if (timestamps[i] < timestamps[i + 1]) {
                isSorted = false;
                break;
            }
        }

        // Assert that the articles are sorted correctly
        expect(isSorted).toBe(true);
    });
});
