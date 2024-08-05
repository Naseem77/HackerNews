const { Page } = require('@playwright/test');

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

module.exports = { BasePage };
