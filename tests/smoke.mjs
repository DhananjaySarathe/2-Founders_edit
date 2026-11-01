import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const base = (process.env.TEST_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const origin = new URL(base).origin;
const resultsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../test-results');
const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; };
const equal = (actual, expected, message) => { assert.equal(actual, expected, message); checks++; };

// Exercise the real local endpoints and assets.
const geo = await fetch(base + '/api/geo', { headers: { 'x-vercel-ip-country': 'IN' } });
equal(geo.status, 200, 'Geo endpoint is available');
for (const [path, type] of [
  ['/styles.css', 'text/css'], ['/app.js', 'javascript'],
  ['/media/fonts/inter-tight.woff2', 'font/woff2'], ['/media/fonts/inter.woff2', 'font/woff2'],
  ['/media/fonts/jetbrains-mono.woff2', 'font/woff2'], ['/media/favicon.svg', 'image/svg+xml'],
  ['/media/social-preview.png', 'image/png']
]) {
  const response = await fetch(base + path);
  equal(response.status, 200, path + ' is available');
  check(response.headers.get('content-type')?.includes(type), path + ' uses the correct content type');
  check((await response.arrayBuffer()).byteLength > 0, path + ' is not empty');
}

const PROJECTS = ['Framecast', 'AI Video Editor', 'ExpenseWaale', 'StockTax Pro', 'Liquid Signal', 'Assistant Agent'];

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
try {
  await mkdir(resultsDir, { recursive: true });
  const errors = [];
  const watch = page => {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && message.location().url.startsWith(origin)) errors.push(message.text());
    });
  };
  const local = async context => {
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    return context;
  };

  const context = await local(await browser.newContext({ viewport: { width: 1440, height: 900 } }));
  const page = await context.newPage();
  watch(page);
  await page.goto(base + '/?c=SmokeCompany', { waitUntil: 'networkidle' });

  equal(await page.title(), 'SmokeCompany × 2 Founders', 'Company links personalise the title');
  equal(await page.locator('#contact-title').innerText(), 'What should we build for SmokeCompany?', 'Company links personalise the closing question');
  equal(await page.locator('main').count(), 1, 'Page has one main landmark');
  equal(await page.locator('h1').count(), 1, 'Page has one main heading');
  equal((await page.locator('h1').innerText()).replace(/\s+/g, ' ').toLowerCase(), "we ship what you'd hire a team for.", 'Hero states the offer');
  await page.keyboard.press('Tab');
  equal(await page.locator(':focus').innerText(), 'Skip to content', 'Keyboard starts with the skip link');

  for (const name of PROJECTS) {
    equal(await page.getByRole('heading', { level: 3, name, exact: true }).count(), 1, name + ' has its own slide');
  }
  equal(await page.locator('.slide-shot img:not([alt=""])').count(), 5, 'Every project screenshot has a text alternative');
  equal(await page.locator('.slide-shot svg[role="img"] title').count(), 1, 'The private build drawing has a text alternative');
  for (const name of ['framecast', 'expensewaale', 'stocktax', 'liquidsignal', 'assistant']) {
    const r = await fetch(`${base}/media/work/${name}-1600.webp`);
    equal(r.status, 200, name + ' screenshot is served');
  }

  // The hero deck fans out six real projects with one in front.
  check(await page.locator('.deck.is-ready').count() === 1, 'Hero deck is laid out');
  equal(await page.locator('.deck-card').count(), 6, 'Hero deck shows all six projects');
  equal(await page.locator('.deck-card[data-pos="0"]').count(), 1, 'One project sits in front');

  // Desktop: the work stage pins and Next moves to the following project.
  check(await page.evaluate(() => document.documentElement.classList.contains('pin')), 'Work carousel pins on wide screens');
  await page.evaluate(() => scrollTo(0, document.getElementById('work').offsetTop + 2));
  await page.waitForTimeout(300);
  equal(await page.locator('[data-count]').innerText(), '01', 'Carousel starts on the first project');
  await page.getByRole('button', { name: 'Next project' }).click();
  await page.waitForFunction(() => document.querySelector('[data-count]').textContent === '02');
  check(true, 'Next project moves the carousel on');
  await page.getByRole('button', { name: 'Liquid Signal', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[data-count]').textContent === '05');
  check(true, 'Rail buttons jump straight to a project');
  for (const href of [
    'https://dhananjaysarathe.github.io/framecast-site/',
    'https://expensewalle.vercel.app/',
    'https://stock-tax-pro.vercel.app/landing',
    'https://sartha555k.github.io/n8n-ai-agent-walkthrough/'
  ]) {
    equal(await page.locator(`a[href="${href}"]`).count(), 1, href + ' is linked once');
  }
  equal(await page.locator('a[href^="https://chromewebstore.google.com/detail/liquid-signal"]').count(), 1, 'Liquid Signal links to the Web Store');
  equal(await page.locator('a[href="mailto:hello@2founders.space"]').count(), 2, 'The contact email appears in contact and footer');
  equal(await page.locator('text=beyondthebuildofficial').count(), 0, 'The old email is gone');

  // The thread is built and draws further as the visitor scrolls.
  await page.waitForFunction(() => document.querySelector('#threadOver').classList.contains('ready'));
  const offset = () => page.evaluate(() => parseFloat(document.querySelector('#threadBack').style.strokeDashoffset));
  await page.waitForTimeout(1800);
  const top = await offset();
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(1200);
  check(await offset() < top, 'Scrolling draws more of the thread');
  check(/^IST \d\d:\d\d$/.test(await page.locator('.site-header [data-clock]').innerText()), 'Header shows local time in India');

  // Enquiry: empty brief is caught, a full brief prepares the email.
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Write the email' }).click();
  check(await page.locator('#briefError').isVisible(), 'Empty brief shows an error');
  equal(await page.locator('#brief').getAttribute('aria-invalid'), 'true', 'Empty brief is marked invalid');
  await page.getByText('An AI workflow or agent').click();
  await page.locator('#brief').fill('Automate our weekly sales report.');
  await page.locator('#timeline').selectOption('Within a month');
  await page.getByRole('button', { name: 'Write the email' }).click();
  await page.waitForSelector('#mailtoRetry');
  const mailto = await page.locator('#mailtoRetry').getAttribute('href');
  check(mailto.startsWith('mailto:hello@2founders.space?subject='), 'Brief opens an email to hello@2founders.space');
  check(decodeURIComponent(mailto).includes('What we need: An AI workflow or agent'), 'Email carries the chosen need');
  check(decodeURIComponent(mailto).includes('Timeline: Within a month'), 'Email carries the timeline');
  check(decodeURIComponent(mailto).includes('(SmokeCompany)'), 'Email subject carries the company');
  await page.screenshot({ path: resolve(resultsDir, 'desktop.png'), fullPage: true });
  await context.close();

  // Phone: nothing overflows sideways.
  const phone = await local(await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true }));
  const phonePage = await phone.newPage();
  watch(phonePage);
  await phonePage.goto(base + '/', { waitUntil: 'networkidle' });
  equal(await phonePage.evaluate(() => document.documentElement.scrollWidth), 390, 'No sideways scroll on a phone');
  check(!(await phonePage.evaluate(() => document.documentElement.classList.contains('pin'))), 'Phones get a swipe carousel, not a pinned one');
  await phonePage.locator('#work').scrollIntoViewIfNeeded();
  await phonePage.getByRole('button', { name: 'Next project' }).click();
  await phonePage.waitForFunction(() => document.querySelector('[data-count]').textContent === '02');
  check(true, 'Next project swipes the phone carousel');
  await phonePage.screenshot({ path: resolve(resultsDir, 'mobile.png'), fullPage: true });
  await phone.close();

  // Reduced motion: the thread and drawings are complete, nothing loops.
  const reduced = await local(await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' }));
  const reducedPage = await reduced.newPage();
  watch(reducedPage);
  await reducedPage.goto(base + '/', { waitUntil: 'networkidle' });
  await reducedPage.waitForFunction(() => document.querySelector('#threadOver').classList.contains('ready'));
  await reducedPage.waitForTimeout(300);
  const motion = await reducedPage.evaluate(() => ({
    smooth: getComputedStyle(document.documentElement).scrollBehavior,
    offset: parseFloat(document.querySelector('#threadBack').style.strokeDashoffset),
    hidden: document.querySelectorAll('.draw:not(.in)').length,
    animated: [...document.querySelectorAll('body *')].filter(el => getComputedStyle(el).animationName !== 'none').length
  }));
  equal(motion.smooth, 'auto', 'Reduced motion disables smooth scrolling');
  equal(motion.offset, 0, 'Reduced motion shows the whole thread');
  equal(motion.hidden, 0, 'Reduced motion shows every drawing');
  equal(motion.animated, 0, 'Reduced motion stops looping animations');
  await reduced.close();

  // Without JavaScript the content and email link still work.
  const nojs = await local(await browser.newContext({ javaScriptEnabled: false }));
  const nojsPage = await nojs.newPage();
  await nojsPage.goto(base + '/', { waitUntil: 'networkidle' });
  check(await nojsPage.getByRole('heading', { name: 'Framecast', exact: true }).isVisible(), 'Work is readable without JavaScript');
  equal(await nojsPage.evaluate(() => document.documentElement.scrollWidth), 1280, 'No sideways scroll without JavaScript');
  equal(await nojsPage.locator('#enquiryForm').getAttribute('action'), 'mailto:hello@2founders.space', 'Form falls back to a mailto action');
  await nojs.close();

  assert.deepEqual(errors, [], 'No page JavaScript errors'); checks++;
  console.log(`PASS: ${checks} smoke checks. Screenshots in test-results/. External links and email delivery are not exercised.`);
} finally { await browser.close(); }
