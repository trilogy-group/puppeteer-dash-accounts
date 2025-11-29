// Test this file locally with: node --env-file=.env index.js

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const ResponseObject = require('./responseObj');
const { getSsmParameter } = require('./utils');

exports.handler = async (event) => {
  let browser = null;
  let skillResponse;
  const isLocal = !process.env.AWS_EXECUTION_ENV;

  // 1. Retrieve a password from SSM (or .env for local dev)
  const password = await getSsmParameter('/your-product/your-app/password');
  console.log('Retrieved password (length):', password ? password.length : 0);

  // 2. Parse Input Parameters (for example, these can be variables extracted from a Kayako ticket)
  // You can set parameters locally at the very end of this file
  // Define a parameter
  let username;
  // Extract the parameter (prod only)
  if (event.body) {
    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      if (body.username) username = body.username;
    } catch (e) {
      console.log('Error parsing body:', e);
    }
  } else if (event.queryStringParameters && event.queryStringParameters.username) {
    username = event.queryStringParameters.username;
  }
  console.log('Using username:', username);

  try {
    // 3. Launch Browser
    let launchConfig;
    if (isLocal) {
      console.log('Running locally: Launching local Chrome...');
      launchConfig = {channel: 'chrome', headless: false};
    } else {
      console.log('Running in Lambda: Using @sparticuz/chromium...');
      launchConfig = {args: chromium.args, defaultViewport: chromium.defaultViewport, executablePath: await chromium.executablePath(), headless: chromium.headless};
    }

    browser = await puppeteer.launch(launchConfig);
    const page = await browser.newPage();

    // 4. Navigate to URL
    console.log('Navigating to Login Page...');
    await page.goto('https://the-internet.herokuapp.com/login');
    
    // Wait to let the user see the page load (1 second)
    await new Promise(r => setTimeout(r, 1000));

    // 5. Enter Username
    console.log('Entering username...');
    const usernameSelector = '#username';
    await page.waitForSelector(usernameSelector);
    await page.type(usernameSelector, username);

    // 6. Enter Password
    console.log('Entering password...');
    const passwordSelector = '#password';
    await page.type(passwordSelector, password); // For success, use 'SuperSecretPassword!' in your .env

    // Wait to let the user see the typed text (1 second)
    await new Promise(r => setTimeout(r, 1000));

    // 7. Click Login
    console.log('Clicking Login...');
    const loginButtonSelector = 'button[type="submit"]';
    await page.click(loginButtonSelector);

    // 8. Wait for Result
    // Wait for the flash message to appear (success or failure)
    await page.waitForSelector('#flash');
    console.log('Successfully attempted login');

    // 9. Create the response
    skillResponse = new ResponseObject(true, 200, 'Successfully performed login interaction');

  } catch (error) {
    console.error('Automation failed:', error);
    skillResponse = new ResponseObject(false, 500, `Automation failed: ${error.message}`);
  } finally {
    // Only close the browser if running in Lambda, so we can inspect locally
    if (browser && !isLocal) {
      await browser.close();
    } else if (isLocal) {
      console.log('Running locally: Keeping browser open for inspection. Use Ctrl+C to exit.');
    }
  }

  console.log('Skill response:', skillResponse.toString());
  return skillResponse.getResult();
};

// Local testing support
if (require.main === module) {
  (async () => {
    // Mock event with parameters
    const event = { 
      path: '/test', 
      body: JSON.stringify({ 
        username: 'tomsmith' // Set input parameters locally here
      })
    };
    await exports.handler(event);
  })();
}