import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function expectNoA11yViolations(page: Page) {
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations).toEqual([]);
}

test('mobile shell routes have no detectable a11y issues @a11y @a11y-full', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Calorie intake tracker' })).toBeVisible();
	await expectNoA11yViolations(page);

	await page
		.getByRole('navigation', { name: 'Primary' })
		.getByRole('link', { name: 'Form' })
		.click();
	await expect(page).toHaveURL(/\/login\?next=%2Fform$/);
	await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
	await expectNoA11yViolations(page);

	await page.goto('/settings');
	await expect(page.getByRole('heading', { name: 'Settings', level: 2 })).toBeVisible();
	await expectNoA11yViolations(page);
});
