const { test, expect } = require('@playwright/test');

test('Check application for errors and basic E2E flow', async ({ page }) => {
    const errors = [];

    page.on('pageerror', err => errors.push(`PageError: ${err.message}`));
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`ConsoleError: ${msg.text()}`);
        }
    });

    // Navigate to local server
    await page.goto('/');

    // Verify elements loaded
    await expect(page.locator('.logo')).toBeVisible();

    // Test Issue Cheque flow
    await page.click('button[data-target="issue"]');
    await expect(page.locator('#issueForm')).toBeVisible();

    await page.fill('#chequeDate', '2026-03-06');
    await page.fill('#payeeName', 'Test Corp');
    await page.fill('#chequeAmount', '1500.5'); // includes decimal
    await page.selectOption('#chequeType', 'A/c Payee');
    await page.fill('#chequeNumber', '123456');
    await page.fill('#remarks', 'Test remark');
    await page.fill('#rtgsName', 'Test RTGS Name');

    // Submit the form
    await page.click('button[type="submit"]');

    // Check the table if the record was added
    await expect(page.locator('#issuedTableBody tr')).toHaveCount(1);

    // Test Print Cheque flow
    await page.click('button[data-target="print"]');

    // Select the newly added cheque from the dropdown
    await page.selectOption('#printChequeSelect', { index: 1 });

    // Verify preview is rendered
    await expect(page.locator('#previewContent')).not.toBeEmpty();
    const previewText = await page.locator('#previewContent').innerText();

    // It should contain 'Test Corp' and 'Rupees'
    expect(previewText).toContain('TEST CORP'); // It was uppercased
    expect(previewText).toContain('Rupees One Thousand Five Hundred');

    // Check changing offset updates preview (just a basic interaction)
    await page.fill('#offsetX', '5');

    // Test Report flow
    await page.click('button[data-target="report"]');
    await expect(page.locator('#reportStats .stat-card')).toHaveCount(2);

    // Assert no errors occurred during the entire flow
    expect(errors).toEqual([]);
});
