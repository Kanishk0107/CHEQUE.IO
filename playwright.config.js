const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    fullyParallel: true,
    retries: 0,
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: 'http://127.0.0.1:8080',
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'npx serve -l 8080',
        url: 'http://127.0.0.1:8080',
        reuseExistingServer: !process.env.CI,
    },
});
