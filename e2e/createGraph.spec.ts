import { test } from '@playwright/test';

test('create graph', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('button', { name: 'Connect' }).click();
    await page.getByText('Select Graph...').click();
    await page.getByRole('button', { name: 'Create new Graph...' }).click();
    await page.getByPlaceholder('Graph name').fill('falkorDB');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByPlaceholder('MATCH (n) OPTIONAL MATCH (n').fill('CREATE (:Rider {name:\'Valentino Rossi\'})-[:rides]->(:Team {name:\'Yamaha\'}), (:Rider {name:\'Dani Pedrosa\'})-[:rides]->(:Team {name:\'Honda\'}), (:Rider {name:\'Andrea Dovizioso\'})-[:rides]->(:Team {name:\'Ducati\'})');
    await page.getByRole('button').first().click();
    await page.getByText("falkorDB").first().click()
});