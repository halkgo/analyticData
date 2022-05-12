const { test, expect } = require('@playwright/test');
const Joi = require('joi');
const schema = Joi.object().keys((
  {
    se_ac: 'suggest_click-0',
    se_ca: 'search_box',
    se_la: 'vacancy',
    se_pr: 'main_page',
    se_va: 'Менеджер',
  }
));

test('Поиск вакансии через search-box с главной страницы', async ({ page }) => {
  await page.goto('https://www.superjob.ru/');
  await page.fill('.f-test-input-keywords', 'Менеджер');
  
  const [request] = await Promise.all([
    // Waits for the next request matching some conditions
    page.waitForRequest(request => request.url().includes('com.snowplowanalytics.snowplow/tp2') 
      && request.method() === 'POST'
      && request.postData().includes('search_box'),
    ),
    // Triggers the request
    page.click('.f-test-link-Menedzher'),
  ]);


  const body = JSON.parse(request.postData());
  const data = body.data[0];

  const validationResult = schema.validate(data, { allowUnknown: true });

  if (validationResult.error) {
    throw new Error(
      `${validationResult.error}`,
    );
  }
  const title = page.locator('h1');
  await expect(title).toHaveText('Вакансии менеджера в Москве');
});