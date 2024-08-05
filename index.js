const { test, expect, chromium } = require('@playwright/test');

// Define the BasePage class
class BasePage {
    constructor(page) {
        this.page = page;
    }

    async initPage() {
        await this.page.waitForLoadState();
    }

    getCurrentURL() {
        return this.page.url();
    }

    async refreshPage() {
        await this.page.reload();
    }
}

// Define the MainPage class
class MainPage extends BasePage {
    constructor(page) {
        super(page);
        this.initPage(); // Initialize the page
        this.moreButton = page.locator("//a[text()='More']");
        this.articles = page.locator("//tbody//td[contains(@class, 'subtext')]//span[contains(@class, 'age')]");
    }

    async getArticles() {
        // Get the attributes from the elements
        const articleElements = await this.articles.evaluateAll(elements =>
            elements.map(el => el.getAttribute('title') || '')
        );

        // Filter out empty strings (which represent null attributes)
        const articles = articleElements.filter(title => title !== '');

        return articles;
    }

    async loadMoreArticles(maxArticles) {
        let allArticles = [];
        let loadedArticles = 0;

        while (loadedArticles < maxArticles) {
            // Get current articles
            const articles = await this.getArticles();
            allArticles = allArticles.concat(articles);

            if (allArticles.length >= maxArticles) {
                break;
            }

            // Click "More" button to load more articles
            await this.moreButton.click();

            // Wait for the page to load more articles
            await this.page.waitForLoadState('networkidle');
            
            // Update the count of loaded articles
            loadedArticles = allArticles.length;
        }

        // Return only the number of articles requested
        return allArticles.slice(0, maxArticles);
    }

    async deleteAllAddress() {
        const isVisible = await this.moreButton.first().isVisible();
        if (!isVisible) return "button not visible!";
      
        await this.moreButton.click();
    }
}

// Utility function to parse date strings into Date objects
function parseDate(dateString) {
    return new Date(dateString);
}

// Define the test suite
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

        // Optionally, verify the exact order if needed
        // for (let i = 0; i < timestamps.length - 1; i++) {
        //     expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
        // }
    });
});
