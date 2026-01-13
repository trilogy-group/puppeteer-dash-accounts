// Test this file locally with: node --env-file=.env lambda/index.js

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const ResponseObject = require('./responseObj');
const { getSsmParameter } = require('./utils');

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  let browser = null;
  let skillResponse;
  const isLocal = !process.env.AWS_EXECUTION_ENV;

  // Helper to parse body
  let body = {};
  if (event.body) {
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (err) {
      console.error('Failed to parse body JSON:', err);
    }
  }
  const query = event.queryStringParameters || {};

  console.log('Parsed Body:', body);
  console.log('Query Params:', query);

  // Test mode follows the same pattern as other agentic skills: only when ?test_mode=true
  const testMode = query.test_mode === 'true';

  const name = body.name || query.name;
  const targetEmail = body.targetEmail || query.targetEmail;

  console.log(`Request received for Name: ${name}, Email: ${targetEmail}, TestMode: ${testMode}`);

  // 2. Handle Test Mode
  if (testMode) {
    skillResponse = new ResponseObject(true, 200, `Testing create admin account for ${name} (${targetEmail})`);
    console.log('Test mode enabled, returning success without automation.');
    console.log('Skill response:', skillResponse.toString());
    return skillResponse.getResult();
  }

  // Validate required parameters
  if (!name || !targetEmail) {
      skillResponse = new ResponseObject(false, 400, `Missing required parameters: Name (${name}), Email (${targetEmail})`);
      console.log('Skill response:', skillResponse.toString());
      return skillResponse.getResult();
  }

  try {
    // 3. Retrieve Credentials
    const email = await getSsmParameter('/edu/dash/user_email');
    const password = await getSsmParameter('/edu/dash/user_password');
    
    if (!email || !password) {
        throw new Error('Missing credentials in SSM');
    }

    // 4. Launch Browser
    let launchConfig;
    if (isLocal) {
      console.log('Running locally: Launching local Chrome...');
      launchConfig = {
        channel: 'chrome', 
        headless: false,
        defaultViewport: { width: 1600, height: 1000 }
      };
    } else {
      console.log('Running in Lambda: Using @sparticuz/chromium...');
      chromium.setHeadlessMode = true;
      chromium.setGraphicsMode = false;
      
      launchConfig = {
        args: chromium.args, 
        defaultViewport: chromium.defaultViewport ?? { width: 1600, height: 1000 }, 
        executablePath: await chromium.executablePath(), 
        headless: chromium.headless
      };
    }

    browser = await puppeteer.launch(launchConfig);
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000 });

    // 5. Automation Logic
    const loginUrl = 'https://dash.alpha.school/';
    
    console.log('[dash_admin] Navigating to login page...');
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 180000 });

    console.log('[dash_admin] Filling login form...');
    await page.waitForSelector("input[name='email']", { timeout: 90000 });
    await page.type("input[name='email']", email, { delay: 20 });
    await page.type("input[name='password']", password, { delay: 20 });

    console.log('[dash_admin] Submitting login form...');
    await page.click("button[type='submit']");

    console.log('[dash_admin] Waiting for dashboard redirect...');
    await page.waitForFunction(() => window.location.href.includes('dashboard'), { timeout: 60000 });
    
    // Wait a bit for session to settle
    await new Promise(r => setTimeout(r, 5000));

    console.log('[dash_admin] Navigating to new user page...');
    await page.goto('https://dash.alpha.school/user/new/', {
      waitUntil: 'networkidle0',
      timeout: 180000,
    });

    if (!page.url().includes('/user/new')) {
        console.log('[dash_admin] Direct navigation might have failed, checking URL...');
        await page.waitForFunction(() => window.location.href.includes('/user/new'), { timeout: 30000 })
            .catch(() => console.log('[dash_admin] Failed to reach /user/new, current URL:', page.url()));
    }

    console.log(`[dash_admin] Filling form with Name: ${name}, Email: ${targetEmail}`);

    await page.waitForSelector("input[name='name']", { timeout: 30000 });
    await page.type("input[name='name']", name, { delay: 20 });
    await page.type("input[name='email']", targetEmail, { delay: 20 });
    await page.select("select[name='role']", "Admin");

    await page.click("button[type='submit']");
    
    console.log('[dash_admin] Form submitted. Waiting for completion...');
    try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    } catch (e) {
        console.log('[dash_admin] Navigation timeout or no navigation occurred after submit.');
    }

    const finalUrl = page.url();
    console.log('[dash_admin] Final URL:', finalUrl);

    if (!finalUrl.includes('/user/new')) {
        skillResponse = new ResponseObject(true, 200, `SUCCESS: Account creation initiated for ${targetEmail}.`);
    } else {
        skillResponse = new ResponseObject(false, 500, `WARNING: Still on the form page. Check validation.`);
    }

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
        name: 'Harry Test Admin',
        targetEmail: 'test.harry@alpha.school',
        testMode: false // Set to true to test without launching browser
      })
    };
    await exports.handler(event);
  })();
}