import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('button', { name: 'Connect' }).click();
    await page.getByText('Select Graph...').click();
    await page.getByRole('button', { name: 'Create new Graph...' }).click();
    await page.getByPlaceholder('Graph name').fill('falkorDB');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(2000)
    await page.getByPlaceholder('MATCH (n) OPTIONAL MATCH (n)').fill('CREATE (:Rider {name:\'Valentino Rossi\'})-[:rides]->(:Team {name:\'Yamaha\'}), (:Rider {name:\'Dani Pedrosa\'})-[:rides]->(:Team {name:\'Honda\'}), (:Rider {name:\'Andrea Dovizioso\'})-[:rides]->(:Team {name:\'Ducati\'})');
    await page.getByRole('button').first().click();
    await page.getByPlaceholder('MATCH (n) OPTIONAL MATCH (n)').click({ clickCount: 3 });
    await page.getByPlaceholder('MATCH (n) OPTIONAL MATCH (n)').fill('');
});

test('delete graph', async ({ page }) => {
    await page.getByRole('button').nth(1).click();
    await page.getByRole('button', { name: 'Delete graph' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByText('Select Graph...').click()
});

test('tabs navigation', async ({ page }) => {
    await page.getByRole('button').first().click();
    await page.getByRole('tab', {name: 'Graph'}).click();
    await page.getByRole('tab', {name: 'Data'}).first().click();
    await page.getByRole('tab', {name: 'Metadata'}).click();
});