import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'
import fs from 'fs';

test.beforeEach(async ({ page }) => {
  //mocking api
  await page.route('*/**/api/tags', async route => {

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(tags)
    })
  });

  await page.goto('https://conduit.bondaracademy.com/');

})


test('Mock etiketler arayüzde doğru şekilde listelenmeli', async ({ page }) => {
  await page.route('*/**/api/articles*', async route => {

    const response = await route.fetch()
    const responseBody = await response.json();
    responseBody.articles[0].title = "This is a MOCK test title"
    responseBody.articles[0].description = "This is a MOCK description"

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseBody)
    })
  })

  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK description')
});

/////delete
test('delete article', async ({ page, request }) => {
  const authData = JSON.parse(fs.readFileSync('.auth/user.json', 'utf8'));
  const token = authData.origins[0].localStorage[0].value;

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
        "title": "Test Article Title",
        "description": "This is a test description for the article",
        "body": "This is the body of the test article. It contains some content.",
        "tagList": []
      }
    },
    headers: {
      'Authorization': `Token ${token}`
    }
  })

  expect(articleResponse.status()).toEqual(201);
  await page.getByText('Global Feed').click()
  const articleLink = page.getByText('Test Article Title').first();
  await expect(articleLink).toBeVisible();
  await articleLink.click();
  await page.getByRole('button', { name: 'Delete Article' }).first().click()
  await page.getByText('Global Feed').click()
  await expect(page.getByText('Test Article Title')).not.toBeVisible();

})


test('create article', async ({ page, request }) => {
  const authData = JSON.parse(fs.readFileSync('.auth/user.json', 'utf8'));
  const token = authData.origins[0].localStorage[0].value;

  const articleTitle = 'Playwright is awesome ' + Date.now();

  await page.getByText('New Article').click();
  await page.getByRole('textbox', { name: 'Article Title' }).fill(articleTitle)
  await page.getByRole('textbox', { name: 'What\'s this article about?' }).fill('About the PW');
  await page.getByRole('textbox', { name: 'Write your article (in markdown)' }).fill('We like to use Playwright for automation');
  await page.getByRole('button', { name: 'Publish Article' }).click()

  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/');
  const articleResponseBody = await articleResponse.json();
  const slugId = articleResponseBody.article.slug;

  await expect(page.locator('h1')).toContainText(articleTitle);
  await page.getByText('Home').click();
  await page.getByText('Global Feed').click();
  await expect(page.locator('app-article-list h1').first()).toContainText(articleTitle);

  const deleteArticleReqest = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  expect(deleteArticleReqest.status()).toEqual(204);

})  