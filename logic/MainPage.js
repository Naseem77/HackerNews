const { BasePage } = require('../infra/BasePage');

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

module.exports = { MainPage };

