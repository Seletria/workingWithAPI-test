import { test as setup } from '@playwright/test';
import fs from 'fs';

// const authFile = '.auth/user.json';

// setup('authentication', async ({ page, request }) => {
//   // await page.goto('https://conduit.bondaracademy.com/');
//   // await page.getByText('Sign in').click();
//   // await page.getByRole('textbox', { name: 'Email' }).fill('esra@gmail.com');
//   // await page.getByRole('textbox', { name: 'Password' }).fill('esra1234');
//   // await page.getByRole('button').click();
//   // await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags');

//   // await page.context().storageState({ path: authFile })

//   const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
//     data: { "user": { "email": "esra@gmail.com", "password": "esra1234" } }
//   })

//   const responseBody = await response.json();
//   const accessToken = responseBody.user.token;
//   user.origins[0].localStorage[0].value = accessToken;

//   fs.writeFileSync(authFile, JSON.stringify(user))

//   process.env['ACCESS_TOKEN'] = accessToken
// })

const authFile = '.auth/user.json';

setup('authentication', async ({ request }) => {

  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: { "user": { "email": "esra@gmail.com", "password": "esra1234" } }
  });

  const responseBody = await response.json();
  const accessToken = responseBody.user.token;

  const storageState = {
    cookies: [],
    origins: [
      {
        origin: 'https://conduit.bondaracademy.com',
        localStorage: [
          {
            name: 'jwtToken',
            value: accessToken
          }
        ]
      }
    ]
  };

  // Ensure the .auth directory exists
  fs.mkdirSync('.auth', { recursive: true });

  fs.writeFileSync(authFile, JSON.stringify(storageState));
});