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

// Measure rendered text, not just its container: a short overflow-hidden line can clip descenders.
function headlineGeometry() {
  const heading = document.querySelector('.hero h1');
  const rot = document.querySelector('#rot');
  const word = rot.querySelector('.on');
  const range = document.createRange();
  range.selectNodeContents(word);
  const text = range.getBoundingClientRect();
  const clip = rot.getBoundingClientRect();
  const navBottom = document.querySelector('#nav').getBoundingClientRect().bottom;
  const fits = rect => rect.top >= navBottom && rect.bottom <= innerHeight && rect.left >= 0 && rect.right <= innerWidth;
  const headingBox = heading.getBoundingClientRect();
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const staticText = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.textContent.trim() || node.parentElement.closest('.sr-only, #rot')) continue;
    const staticRange = document.createRange();
    staticRange.selectNodeContents(node);
    staticText.push(...staticRange.getClientRects());
  }
  return {
    word: word.textContent.trim(),
    wordFits: text.top >= clip.top - 0.5 && text.bottom <= clip.bottom + 0.5 && text.left >= clip.left - 0.5 && text.right <= clip.right + 0.5 && fits(text),
    clipping: { top: clip.top - text.top, bottom: text.bottom - clip.bottom, left: clip.left - text.left, right: text.right - clip.right },
    centered: getComputedStyle(heading).textAlign === 'center' && Math.abs((headingBox.left + headingBox.right) / 2 - innerWidth / 2) < 1,
    categoryFits: fits(document.querySelector('.hero-eyebrow').getBoundingClientRect()),
    headingFits: fits(headingBox) && staticText.every(fits),
    ctasFit: [...document.querySelectorAll('.hero-ctas a')].every(el => fits(el.getBoundingClientRect())),
    proofBeforeBoard: document.querySelector('.built-strip').getBoundingClientRect().bottom < document.querySelector('.workflow-board').getBoundingClientRect().top
  };
}
const settledWord = async (page, word) => page.waitForFunction(expected => {
  const el = document.querySelector('#rot .on');
  if (!el || el.textContent.trim() !== expected) return false;
  const style = getComputedStyle(el);
  return style.opacity === '1' && style.transform === 'none';
}, word);

const waitProject = async (page, index, settled = true) => page.waitForFunction(({ index, settled }) => {
  const root = document.querySelector('#product');
  const viewport = document.querySelector('#portfolioViewport').getBoundingClientRect();
  const slide = document.querySelectorAll('#portfolioTrack > [data-work-title]')[index].getBoundingClientRect();
  return root.dataset.activeProject === String(index) && (!settled || Math.abs(slide.left - viewport.left) < 2);
}, { index, settled });
const chooseProject = async (page, index) => {
  await page.locator('#portfolioTabs button[data-project="' + index + '"]').click();
  await waitProject(page, index);
};
function portfolioRange() {
  const root = document.querySelector('#product');
  const runway = document.querySelector('#portfolioScroll').getBoundingClientRect();
  const pin = document.querySelector('#portfolioPin').getBoundingClientRect();
  return {
    start: runway.top + scrollY - parseFloat(getComputedStyle(root).getPropertyValue('--portfolio-top')),
    travel: runway.height - pin.height,
    pinFits: pin.top >= document.querySelector('#nav').getBoundingClientRect().bottom && pin.bottom <= innerHeight,
    mode: root.dataset.mode
  };
}

// Exercise the real local endpoints and assets, including the video range support.
for (const country of ['', 'IN', 'US']) {
  const response = await fetch(base + '/api/geo', { headers: country ? { 'x-vercel-ip-country': country } : {} });
  equal(response.status, 200, 'Geo endpoint is available');
  equal(response.headers.get('cache-control'), 'no-store', 'Geo responses are not cached');
  assert.deepEqual(await response.json(), { country }); checks++;
}
for (const [path, type] of [
  ['/styles.css', 'text/css'], ['/product.css', 'text/css'], ['/landing.css', 'text/css'], ['/portfolio.css', 'text/css'],
  ['/app.js', 'javascript'], ['/portfolio.js', 'javascript'],
  ['/media/fonts/inter-tight.woff2', 'font/woff2'], ['/media/fonts/inter.woff2', 'font/woff2'],
  ['/media/fonts/jetbrains-mono.woff2', 'font/woff2'], ['/media/favicon.svg', 'image/svg+xml'],
  ['/media/pitch-poster.jpg', 'image/jpeg'], ['/media/social-preview.png', 'image/png']
]) {
  const response = await fetch(base + path);
  equal(response.status, 200, path + ' is available');
  check(response.headers.get('content-type')?.includes(type), path + ' uses the correct content type');
  check((await response.arrayBuffer()).byteLength > 0, path + ' is not empty');
}
const media = await fetch(base + '/media/pitch.mp4', { headers: { range: 'bytes=0-99' } });
equal(media.status, 206, 'Video supports range requests');
equal((await media.arrayBuffer()).byteLength, 100, 'Video range is the requested length');

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: 'UTC' });
  // Third-party playback is checked through iframe wiring; this suite is otherwise local.
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  // Exercise the visible manual-copy fallback when browser clipboard access fails.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('Clipboard unavailable in this check')) }
    });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && message.location().url.startsWith(origin)) errors.push(message.text());
  });
  const goto = query => page.goto(base + '/' + query, { waitUntil: 'networkidle' });

  await goto('?r=global&c=SmokeCompany');
  equal(await page.title(), '2 Founders × SmokeCompany', 'Company links personalize the title');
  equal(await page.locator('#forName').innerText(), 'SmokeCompany', 'Company links personalize the hero');
  check(await page.locator('#forChip').isVisible(), 'Personalized chip is visible');
  check((await page.locator('.hero-eyebrow').innerText()).toLowerCase().includes('ai automation'), 'Hero communicates the broad company category');
  equal(await page.getByRole('heading', { level: 1, name: 'You build. We automate.', exact: true }).count(), 1, 'Animated headline has a stable accessible name');
  equal(await page.locator('main').count(), 1, 'Page has one main landmark');
  equal(await page.locator('h1').count(), 1, 'Page has one main heading');
  await page.keyboard.press('Tab');
  equal(await page.locator(':focus').innerText(), 'Skip to content', 'Keyboard starts with the skip link');
  const outline = await page.locator(':focus').evaluate(el => getComputedStyle(el).outlineStyle);
  check(outline !== 'none', 'Keyboard focus is visible');

  // The default example is broad business work, clearly distinguished from shipped product proof.
  equal(await page.locator('.scenario-tabs [aria-pressed="true"]').innerText(), 'Business admin', 'Business admin is the default example');
  equal(await page.locator('#workflowKind').innerText(), 'Illustrative custom workflow', 'Default example does not imply a deployed system');
  equal(await page.locator('#workflowOutput').innerText(), 'An organised task + a draft reply', 'Default example shows a business output');
  check((await page.locator('#workflowDetail').innerText()).includes('could build'), 'Default workflow is explicitly hypothetical');
  // A scenario switch must update the complete explanation, rather than only its node labels.
  for (const [name, title, kind, output] of [
    ['Audience research', 'Comments in. Audience insights out.', 'Liquid Signal · product walkthrough', 'A searchable report + CSV / JSON export'],
    ['Creator engine', 'Your channel. Your next three ideas.', 'Our creator workflow · illustrated', '3 daily ideas + an edit for your review'],
    ['Business admin', 'An enquiry. A clear next step.', 'Illustrative custom workflow', 'An organised task + a draft reply']
  ]) {
    await page.getByRole('button', { name, exact: true }).click();
    equal(await page.locator('#workflowPath').innerText(), name, name + ' changes the workflow label');
    equal(await page.locator('#workflowTitle').innerText(), title, name + ' changes the title');
    equal(await page.locator('#workflowKind').innerText(), kind, name + ' changes its evidence label');
    equal(await page.locator('#workflowOutput').innerText(), output, name + ' changes the output');
    equal(await page.locator('.scenario-tabs [aria-pressed="true"]').count(), 1, 'One scenario is selected');
    equal(await page.locator('#workflowNodes [aria-pressed="true"]').count(), 1, 'Switching scenario selects one stage');
  }
  await page.getByRole('button', { name: 'Audience research', exact: true }).click();
  await page.locator('#workflowNodes button').nth(2).click();
  check((await page.locator('#workflowDetail').innerText()).includes('Find the signal'), 'Stage selection updates the explanation');
  equal(await page.locator('#workflowNodes [aria-pressed="true"]').count(), 1, 'One stage is selected');
  await page.getByRole('button', { name: 'Run walkthrough', exact: true }).click();
  equal(await page.locator('#walkthrough').getAttribute('aria-pressed'), 'true', 'Walkthrough starts');
  await page.waitForFunction(() => document.querySelector('#workflowNodes button[data-step="1"]').getAttribute('aria-pressed') === 'true');
  await page.getByRole('button', { name: 'Pause walkthrough', exact: true }).click();
  const pausedDetail = await page.locator('#workflowDetail').innerText();
  await page.waitForTimeout(2750);
  equal(await page.locator('#workflowDetail').innerText(), pausedDetail, 'Paused walkthrough does not advance');
  await page.getByRole('button', { name: 'Business admin', exact: true }).click();
  check((await page.locator('#workflowDetail').innerText()).includes('A new enquiry arrives'), 'Custom workflow is explorable');
  equal(await page.locator('#walkthrough').getAttribute('aria-pressed'), 'false', 'Switching workflow stops playback');

  // Native section links land their heading below the sticky navigation.
  for (const [target, headingId, label] of [
    ['automate', 'workflowTitle', 'An enquiry. A clear next step.'],
    ['services', 'services-heading', 'Your own automation. Or just the result.'],
    ['product', 'proof-heading', 'Our work.'],
    ['how', 'how-heading', 'Start with one task.']
  ]) {
    await page.locator('#nav a[href="#' + target + '"]').click();
    await page.waitForFunction(({ target, headingId }) => {
      const heading = document.getElementById(headingId).getBoundingClientRect();
      return location.hash === '#' + target && heading.top >= document.querySelector('#nav').getBoundingClientRect().bottom && heading.bottom < innerHeight;
    }, { target, headingId });
    equal((await page.locator('#' + headingId).innerText()).replace(/\s+/g, ' '), label, 'Section link exposes the correct heading');
    check(await page.locator('#' + headingId).isVisible(), 'Section link exposes its heading');
  }

  console.log('Checking portfolio scroll, controls, keyboard, and media cleanup…');
  await page.locator('#nav a[href="#product"]').click();
  await waitProject(page, 0);
  equal(await page.locator('#product').getAttribute('data-mode'), 'scroll', 'A fitting desktop frame follows vertical page scroll');
  equal(await page.locator('#portfolioTabs button').count(), 2, 'Project controls are generated from the two real case studies');
  equal(await page.locator('#portfolioCount').innerText(), '01 / 02', 'Project counter starts at the first case study');
  check(await page.locator('#portfolioPrev').isDisabled(), 'Previous is disabled at the first project');
  check(await page.locator('#creator').evaluate(el => el.inert && el.getAttribute('aria-hidden') === 'true'), 'Inactive project is hidden from keyboard and accessibility navigation');
  await page.locator('#creator a[data-enquiry]').evaluate(el => el.focus());
  check(!(await page.locator('#creator a[data-enquiry]').evaluate(el => document.activeElement === el)), 'Inactive project cannot receive keyboard focus');
  const scrollRange = await page.evaluate(portfolioRange);
  check(scrollRange.pinFits && scrollRange.travel > 0, 'Pinned frame fits below navigation with a finite scroll distance');
  await page.mouse.move(1000, 450);
  await page.mouse.wheel(0, scrollRange.travel);
  await waitProject(page, 1);
  equal(await page.locator('#portfolioCount').innerText(), '02 / 02', 'Scrolling down reveals the Creator engine');
  await page.mouse.wheel(0, -scrollRange.travel);
  await waitProject(page, 0);
  equal(await page.locator('#portfolioTabs [aria-pressed="true"]').getAttribute('data-project'), '0', 'Scrolling up restores Liquid Signal and its selected tab');
  await page.locator('#portfolioNext').click();
  await waitProject(page, 1);
  check(await page.locator('#portfolioNext').isDisabled(), 'Next is disabled at the final project');
  check((await page.locator('#portfolioStatus').innerText()).includes('Creator engine, project 2 of 2'), 'Manual navigation announces the selected project');
  await page.locator('#portfolioPrev').click();
  await waitProject(page, 0);
  await page.locator('#portfolioViewport').focus();
  await page.keyboard.press('End');
  await waitProject(page, 1);
  await page.keyboard.press('Home');
  await waitProject(page, 0);
  await page.keyboard.press('ArrowRight');
  await waitProject(page, 1);
  await page.keyboard.press('ArrowLeft');
  await waitProject(page, 0);
  equal(await page.locator('#portfolioViewport').evaluate(el => document.activeElement === el), true, 'Carousel arrow keys keep focus on the keyboard region');
  await chooseProject(page, 1);
  await page.locator('#exSound').click();
  await page.waitForFunction(() => !document.querySelector('#exVideo').paused && !document.querySelector('#exVideo').muted);
  await chooseProject(page, 0);
  check(await page.locator('#exVideo').evaluate(el => el.paused), 'Changing away from Creator pauses the local sample, including sound playback');
  await chooseProject(page, 1);
  check(await page.locator('#exVideo').evaluate(el => el.paused), 'Returning to Creator does not restart previously requested sound');
  check(await page.locator('#work').evaluate(el => !el.closest('#portfolioPin')), 'Expandable video library sits outside the pinned frame');
  await page.locator('#work > summary').click();
  await page.locator('#workGlobal .video-facade').click();
  equal(await page.locator('#work iframe').count(), 1, 'Expanded library can load a requested video');
  await chooseProject(page, 0);
  await page.waitForFunction(() => !document.querySelector('#work iframe'));
  equal(await page.locator('#workGlobal .video-facade').count(), 1, 'Changing away restores the video facade instead of leaving hidden playback');
  await page.locator('#work > summary').click();
  await chooseProject(page, 1);
  await page.locator('#nav a[href="#how"]').click();
  await page.waitForFunction(() => document.querySelector('#how-heading').getBoundingClientRect().top >= document.querySelector('#nav').getBoundingClientRect().bottom && document.querySelector('#how-heading').getBoundingClientRect().bottom < innerHeight);
  check(await page.locator('#exVideo').evaluate(el => el.paused), 'Continuing below Our Work pauses the sample and exposes the next section');

  await goto('?r=global&c=SmokeCompany#creator');
  await waitProject(page, 1);
  check(await page.locator('#creator-heading').evaluate(el => el.getBoundingClientRect().top >= document.querySelector('#nav').getBoundingClientRect().bottom), 'Direct Creator links select and reveal the correct case study');
  await page.locator('#nav a[href="#product"]').click();
  await waitProject(page, 0);
  equal(new URL(page.url()).searchParams.get('c'), 'SmokeCompany', 'Carousel navigation preserves company personalization');
  console.log('Checking service enquiries, language choices, and preserved page flows…');

  // The workflow prompt helps an empty brief while preserving work already written.
  const workflowCTA = page.locator('#automate a[data-brief]');
  await workflowCTA.click();
  equal(await page.locator('#enquiryTask').inputValue(), await workflowCTA.getAttribute('data-brief'), 'Workflow prompt pre-fills an empty brief');
  equal(await page.locator('#enquiryType').inputValue(), 'custom', 'Workflow prompt selects custom automation');
  const draft = 'Our existing draft: move incoming requests into a reviewed task.';
  await page.locator('#enquiryTask').fill(draft);
  await workflowCTA.click();
  equal(await page.locator('#enquiryTask').inputValue(), draft, 'Workflow prompt preserves the existing draft');

  for (const [service, selector] of [
    ['service', '.offer a[data-enquiry="service"]'],
    ['creator', '.creator-copy a[data-enquiry="creator"]'],
    ['custom', '.offer a[data-enquiry="custom"]']
  ]) {
    if (service === 'creator') await chooseProject(page, 1);
    await page.locator(selector).click();
    equal(await page.locator('#enquiryType').inputValue(), service, 'Service CTA prepares the matching enquiry');
  }
  await page.locator('#enquiryTask').fill('   ');
  await page.locator('#enquiryForm button[type="submit"]').click();
  check(!(await page.locator('#enquiryTask').evaluate(el => el.validity.valid)), 'Whitespace-only briefs are rejected');
  check(!(await page.locator('#formStatus').isVisible()), 'Invalid brief does not claim submission');
  await page.locator('#enquiryTask').fill('Audit comments & create three ideas.\nKeep my review step.');
  await page.locator('#enquiryTools').fill('YouTube + Sheets');
  await page.locator('#enquiryForm button[type="submit"]').click({ noWaitAfter: true });
  check(await page.locator('#formStatus').isVisible(), 'Valid brief exposes the email fallback');
  const mailto = new URL(await page.locator('#formStatus a').getAttribute('href'));
  equal(mailto.protocol, 'mailto:', 'Enquiry prepares an email');
  equal(mailto.pathname, 'beyondthebuildofficial@gmail.com', 'Enquiry uses the existing contact address');
  equal(mailto.searchParams.get('subject'), 'Custom automation for SmokeCompany', 'Email subject includes the service and company');
  check(mailto.searchParams.get('body').includes('Audit comments & create three ideas.\nKeep my review step.'), 'Email body preserves the brief');
  check(mailto.searchParams.get('body').includes('Tools I use: YouTube + Sheets'), 'Email body includes tools');
  check(!(await page.locator('#formStatus').innerText()).includes('submitted'), 'Email fallback does not claim a server submission');
  equal(await page.locator('#formStatus a').getAttribute('target'), '_blank', 'Retry keeps the website and fallback available');
  await page.getByRole('button', { name: 'Copy my brief', exact: true }).click();
  const copyFallback = page.getByRole('textbox', { name: 'Your email brief — select and copy', exact: true });
  check(await copyFallback.isVisible(), 'Clipboard failure exposes a manual copy field');
  equal(await copyFallback.inputValue(), mailto.searchParams.get('body'), 'Manual copy preserves the full email brief');
  check(await copyFallback.evaluate(el => el.readOnly && el.selectionEnd === el.value.length), 'Manual copy field is selected and read-only');
  check(await page.locator('#formStatus a').isVisible(), 'Email retry remains available after clipboard failure');
  await page.locator('#enquiryTools').fill('Sheets');
  check(!(await page.locator('#formStatus').isVisible()), 'Editing the brief hides stale email actions');

  await page.locator('#faq > summary').click();
  check(await page.locator('#faq').evaluate(el => el.open), 'FAQ drawer opens');
  const faq = page.locator('#faq details').first();
  await faq.locator('summary').click();
  check(await faq.evaluate(el => el.open), 'FAQ opens');
  await faq.locator('summary').click();
  check(!(await faq.evaluate(el => el.open)), 'FAQ closes');

  // Original language choice and company parameters remain available with lazy embeds.
  equal(await page.locator('body').getAttribute('data-region'), 'global', 'Global override is preserved');
  check(!(await page.locator('#work').evaluate(el => el.open)), 'Video library starts collapsed');
  await page.locator('#work > summary').click();
  equal(await page.locator('#workGlobal .video-facade').count(), 1, 'English example is available');
  equal(await page.locator('#workGlobal iframe').count(), 0, 'YouTube iframe loads only on request');
  await page.locator('#workGlobal .video-facade').click();
  check((await page.locator('#workGlobal iframe').getAttribute('src')).includes('youtube-nocookie.com/embed/_w4H2c_K0EI'), 'English play button loads the existing video');
  check(Boolean(await page.locator('#workGlobal iframe').getAttribute('title')), 'Embedded video has a title');
  await page.getByRole('button', { name: 'Hindi Shorts', exact: true }).click();
  equal(await page.locator('#work iframe').count(), 0, 'Language switch stops and restores the previous embed');
  equal(await page.locator('body').getAttribute('data-region'), 'in', 'Language switch selects India');
  check(await page.locator('#workIn').isVisible(), 'Hindi videos are visible');
  equal(await page.locator('#workIn .video-facade').count(), 2, 'Both existing Hindi examples are available');
  equal(new URL(page.url()).searchParams.get('c'), 'SmokeCompany', 'Language switch preserves company personalization');
  equal(new URL(page.url()).searchParams.get('r'), 'in', 'Manual language choice updates the URL');
  await page.locator('#workIn .video-facade').first().click();
  check((await page.locator('#workIn iframe').getAttribute('src')).includes('mipDRH7hf60'), 'Hindi play button loads the existing short');
  await page.locator('#workIn .video-facade').last().click();
  equal(await page.locator('#workIn iframe').count(), 1, 'Only one Hindi embed can play at a time');
  check((await page.locator('#workIn iframe').getAttribute('src')).includes('Uo2umFjQyc8'), 'Second play button loads the other existing short');
  await page.locator('#nav a[href="#how"]').click();
  await page.waitForFunction(() => !document.querySelector('#work iframe'));
  equal(await page.locator('#work iframe').count(), 0, 'Leaving Our Work stops a requested YouTube embed');
  await page.locator('#workIn .video-facade').last().click();
  await page.locator('#work > summary').click();
  await page.waitForFunction(() => !document.querySelector('#work iframe'));
  equal(await page.locator('#work iframe').count(), 0, 'Closing the video drawer stops playback');
  await goto('?region=india&company=AliasCompany');
  equal(await page.locator('body').getAttribute('data-region'), 'in', 'Legacy region alias is preserved');
  equal(await page.locator('#forName').innerText(), 'AliasCompany', 'Legacy company alias is preserved');
  await goto('?r=global&c=' + encodeURIComponent('<img src=x onerror=alert(1)>'));
  equal(await page.locator('#forName img').count(), 0, 'Company personalization is inserted as text');
  await context.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'IN' });
  await goto('');
  await page.waitForFunction(() => document.body.dataset.region === 'in');
  equal(await page.locator('body').getAttribute('data-region'), 'in', 'Geo detection selects Hindi examples');
  await context.setExtraHTTPHeaders({});

  console.log('Checking native swipe, short viewports, resizing, and future projects…');
  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await touch.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const touchPage = await touch.newPage();
  touchPage.on('pageerror', error => errors.push(error.message));
  await touchPage.goto(base + '/?r=global#product', { waitUntil: 'networkidle' });
  await waitProject(touchPage, 0);
  equal(await touchPage.locator('#product').getAttribute('data-mode'), 'native', 'Phone uses the native horizontal carousel instead of a tall pinned section');
  check(await touchPage.locator('.portfolio-controls').evaluate(el => {
    const box = el.getBoundingClientRect();
    return box.top >= document.querySelector('#nav').getBoundingClientRect().bottom && box.bottom < innerHeight && box.bottom < document.querySelector('#portfolioViewport').getBoundingClientRect().top;
  }), 'Native project controls are visible before the long project card at initial alignment');
  const touchSession = await touch.newCDPSession(touchPage);
  const swipe = async direction => {
    const box = await touchPage.locator('#portfolioViewport').boundingBox();
    const y = Math.max(120, box.y + 60);
    const from = box.x + box.width * (direction > 0 ? 0.85 : 0.15);
    const to = box.x + box.width * (direction > 0 ? 0.15 : 0.85);
    await touchSession.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from, y }] });
    for (let i = 1; i <= 6; i++) {
      await touchSession.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from + (to - from) * i / 6, y }] });
      await touchPage.waitForTimeout(25);
    }
    await touchSession.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await swipe(1);
  await waitProject(touchPage, 1);
  equal(await touchPage.locator('#portfolioCount').innerText(), '02 / 02', 'A real phone touch swipe updates the project and counter');
  await swipe(-1);
  await waitProject(touchPage, 0);
  equal(await touchPage.locator('#portfolioTabs [aria-pressed="true"]').getAttribute('data-project'), '0', 'Swiping back restores the first selected tab');
  await touchPage.locator('#portfolioNext').focus();
  await touchPage.keyboard.press('Enter');
  await waitProject(touchPage, 1);
  await touchPage.keyboard.press('Tab');
  check(await touchPage.evaluate(() => document.activeElement !== document.body && !document.activeElement.disabled && !document.activeElement.closest('[inert]')), 'Keyboard can continue after Next becomes disabled on the last project');
  await touchPage.setViewportSize({ width: 1440, height: 900 });
  await touchPage.waitForFunction(() => document.querySelector('#product').dataset.mode === 'scroll');
  await waitProject(touchPage, 1);
  equal(await touchPage.locator('#product').getAttribute('data-active-project'), '1', 'Resizing from native to pinned mode preserves the visible Creator project');
  await touchPage.setViewportSize({ width: 390, height: 844 });
  await touchPage.waitForFunction(() => document.querySelector('#product').dataset.mode === 'native');
  await waitProject(touchPage, 1);
  equal(await touchPage.locator('#portfolioCount').innerText(), '02 / 02', 'Resizing back to a phone preserves the current project');
  for (const [width, height] of [[320, 844], [768, 844], [1440, 550]]) {
    await touchPage.setViewportSize({ width, height });
    await touchPage.locator('#nav a[href="#product"]').evaluate(el => el.click());
    await waitProject(touchPage, 0);
    check(await touchPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width + '×' + height + ' carousel does not overflow the page');
    if (width === 320 || height === 550) {
      equal(await touchPage.locator('#product').getAttribute('data-mode'), 'native', 'A narrow or short viewport keeps normal vertical page access');
      check(await touchPage.locator('.portfolio-controls').evaluate(el => el.getBoundingClientRect().top >= document.querySelector('#nav').getBoundingClientRect().bottom && el.getBoundingClientRect().bottom < innerHeight), 'Short or narrow fallback exposes all project controls');
    }
    await chooseProject(touchPage, 1);
    await touchPage.locator('.creator-copy a[data-enquiry="creator"]').click();
    equal(await touchPage.locator('#enquiryType').inputValue(), 'creator', 'Creator enquiry remains reachable in the fallback layout');
  }
  // Resize immediately around the real fit threshold: mode-specific spacing must not oscillate.
  await touchPage.setViewportSize({ width: 1440, height: 900 });
  await touchPage.locator('#nav a[href="#product"]').evaluate(el => el.click());
  await waitProject(touchPage, 0);
  const threshold = await touchPage.evaluate(() => Math.ceil(document.querySelector('#portfolioPin').getBoundingClientRect().height) + document.querySelector('#nav').getBoundingClientRect().height + 24);
  for (const height of [threshold - 1, threshold, threshold + 1]) {
    await touchPage.setViewportSize({ width: 1440, height });
    await touchPage.waitForFunction(expected => document.querySelector('#product').dataset.mode === expected, height < threshold ? 'native' : 'scroll');
    await touchPage.waitForTimeout(200);
    const stability = await touchPage.evaluate(() => new Promise(resolve => {
      const root = document.querySelector('#product');
      const initialMode = root.dataset.mode;
      const initialScroll = scrollY;
      let changes = 0;
      const observer = new MutationObserver(records => {
        changes += records.filter(record => record.oldValue !== root.dataset.mode).length;
      });
      observer.observe(root, { attributes: true, attributeFilter: ['data-mode'], attributeOldValue: true });
      setTimeout(() => {
        observer.disconnect();
        resolve({ changes, initialMode, mode: root.dataset.mode, jump: Math.abs(scrollY - initialScroll) });
      }, 400);
    }));
    check(stability.changes === 0 && stability.mode === stability.initialMode && stability.jump < 1, 'Carousel mode and scroll position stay stable at the ' + height + 'px fit boundary');
  }
  await touch.close();

  // Add an explicitly synthetic HTML slide before the unchanged deferred application scripts run.
  // This checks future project discovery without shipping a fictional portfolio project.
  const future = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await future.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    if (url.pathname !== '/' || route.request().resourceType() !== 'document') return route.continue();
    const response = await route.fetch();
    const fixture = '<script>document.getElementById("portfolioTrack").insertAdjacentHTML("beforeend", \'<article class="portfolio-slide" id="future-project" data-work-title="Future test project"><h3>Future project fixture</h3><p>Test-only slide for HTML-driven carousel discovery.</p><a href="#talk">Discuss this workflow</a></article>\');</script>';
    await route.fulfill({ response, body: (await response.text()).replace('</main>', fixture + '</main>') });
  });
  const futurePage = await future.newPage();
  futurePage.on('pageerror', error => errors.push(error.message));
  await futurePage.goto(base + '/?r=global#product', { waitUntil: 'networkidle' });
  await waitProject(futurePage, 0);
  equal(await futurePage.locator('#portfolioTabs button').count(), 3, 'An added HTML project creates its own control without editing JavaScript');
  equal(await futurePage.locator('#portfolioCount').innerText(), '01 / 03', 'Future projects update the total count');
  await chooseProject(futurePage, 2);
  equal(await futurePage.locator('#portfolioCount').innerText(), '03 / 03', 'Future project is reachable by its generated tab');
  check(await futurePage.locator('#portfolioNext').isDisabled(), 'Future project count sets the correct last-slide boundary');
  const futureRange = await futurePage.evaluate(portfolioRange);
  check(futureRange.travel > 0 && futureRange.travel <= 900 * 1.8 + 1, 'Adding projects keeps vertical scroll travel capped');
  await futurePage.evaluate(range => window.scrollTo({ top: range.start + range.travel * 0.5, behavior: 'instant' }), futureRange);
  await waitProject(futurePage, 1);
  equal(await futurePage.locator('#portfolioCount').innerText(), '02 / 03', 'Vertical scrolling maps to the middle of three projects');
  await futurePage.evaluate(range => window.scrollTo({ top: range.start, behavior: 'instant' }), futureRange);
  await waitProject(futurePage, 0);
  check(await futurePage.locator('#future-project').evaluate(el => el.inert), 'An inactive future project follows the same keyboard isolation');
  await future.close();

  console.log('Checking responsive headlines, late fonts, and progressive fallbacks…');
  await goto('?r=global');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 390, 701, 720, 740, 768, 1440]) {
    await page.setViewportSize({ width, height: width > 1000 ? 900 : 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.evaluate(() => document.fonts.ready);
    const structure = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        missingAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(el => !document.getElementById(el.getAttribute('href').slice(1))).map(el => el.getAttribute('href')),
        duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i),
        fontsLoaded: document.fonts.check('600 16px Inter') && document.fonts.check('800 16px "Inter Tight"')
      };
    });
    check(!structure.overflow, width + 'px layout does not overflow');
    assert.deepEqual(structure.missingAnchors, [], 'All local anchors resolve'); checks++;
    assert.deepEqual(structure.duplicateIds, [], 'IDs are unique'); checks++;
    check(structure.fontsLoaded, 'Self-hosted fonts load');
    if ([320, 390, 768, 1440].includes(width)) {
      for (const word of ['build.', 'grow.', 'create.']) {
        await settledWord(page, word);
        const headline = await page.evaluate(headlineGeometry);
        check(headline.wordFits, width + 'px animated ' + word + ' is not clipped: ' + JSON.stringify(headline.clipping));
        check(headline.centered && headline.headingFits && headline.categoryFits, width + 'px first fold shows the centered headline and category');
        check(headline.ctasFit, width + 'px first fold shows both CTAs during ' + word);
      }
      if (width === 390) {
        check((await page.evaluate(headlineGeometry)).proofBeforeBoard, 'Mobile puts shipped proof before the illustrative board');
        equal(await page.locator('#mbar').evaluate(el => getComputedStyle(el).visibility), 'hidden', 'Initial mobile CTA bar is hidden');
        await page.locator('#mbar a').evaluate(el => el.focus());
        check(!(await page.locator('#mbar a').evaluate(el => document.activeElement === el)), 'Hidden mobile CTA cannot take keyboard focus');
      }
      if (width === 390 || width === 1440) {
        await mkdir(resultsDir, { recursive: true });
        await page.screenshot({ path: resolve(resultsDir, width === 390 ? 'mobile.png' : 'desktop.png'), animations: 'disabled' });
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await goto('?r=global');
  await page.locator('#product').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#mbar').classList.contains('show'));
  equal(await page.locator('#mbar').evaluate(el => getComputedStyle(el).visibility), 'visible', 'Mobile CTA becomes available inside the page');
  await page.locator('#mbar a').evaluate(el => el.focus());
  check(await page.locator('#mbar a').evaluate(el => document.activeElement === el), 'Visible mobile CTA can take keyboard focus');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#mbar')).visibility === 'hidden');
  await page.evaluate(() => document.activeElement.blur());
  await page.locator('#mbar a').evaluate(el => el.focus());
  check(!(await page.locator('#mbar a').evaluate(el => document.activeElement === el)), 'Footer hides the mobile CTA from keyboard focus');

  // Resize while local fonts are still pending, then check the real text once they arrive.
  const delayed = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  let releaseFonts;
  const fontGate = new Promise(resolve => { releaseFonts = resolve; });
  let heldFontRequests = 0;
  await delayed.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    if (url.pathname.endsWith('.woff2')) { heldFontRequests++; await fontGate; }
    return route.continue();
  });
  const delayedPage = await delayed.newPage();
  delayedPage.on('pageerror', error => errors.push(error.message));
  try {
    await delayedPage.goto(base + '/?r=global', { waitUntil: 'domcontentloaded' });
    await delayedPage.waitForFunction(() => document.fonts.status === 'loading');
    await delayedPage.setViewportSize({ width: 320, height: 844 });
    releaseFonts();
    await delayedPage.evaluate(() => document.fonts.ready);
    check(heldFontRequests > 0, 'Late-font check actually delayed a local font request');
    check(await delayedPage.evaluate(() => document.fonts.check('800 16px "Inter Tight"')), 'Headline font loads after resizing');
    await settledWord(delayedPage, (await delayedPage.locator('#rot .on').textContent()).trim());
    const headline = await delayedPage.evaluate(headlineGeometry);
    check(headline.wordFits && headline.headingFits && headline.centered && headline.ctasFit, 'Late font loading after resize preserves the headline and CTAs');
  } finally { releaseFonts(); await delayed.close(); }

  // The large headline and engagement links stay usable when JavaScript is disabled.
  const nojs = await browser.newContext({ viewport: { width: 320, height: 844 }, javaScriptEnabled: false });
  await nojs.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const fallbackPage = await nojs.newPage();
  await fallbackPage.goto(base + '/?r=global', { waitUntil: 'networkidle' });
  await fallbackPage.evaluate(() => document.fonts.ready);
  const fallback = await fallbackPage.evaluate(headlineGeometry);
  equal(fallback.word, 'build.', 'No-JavaScript headline shows its complete default word');
  check(fallback.wordFits && fallback.headingFits && fallback.centered && fallback.categoryFits && fallback.ctasFit, 'No-JavaScript first fold has a complete headline and both CTAs');
  equal(await fallbackPage.getByRole('heading', { level: 1, name: 'You build. We automate.', exact: true }).count(), 1, 'No-JavaScript headline remains accessible');
  await fallbackPage.locator('.hero-ctas a[data-enquiry="service"]').click();
  // Native smooth navigation still runs without JS; poll from Node rather than page timers.
  let nativeNavigationSettled = false;
  let previousScroll = -1;
  for (let attempt = 0; attempt < 100; attempt++) {
    const state = await fallbackPage.evaluate(() => {
      const heading = document.querySelector('#services-heading').getBoundingClientRect();
      return { scroll: scrollY, fits: location.hash === '#services' && heading.top >= document.querySelector('#nav').getBoundingClientRect().bottom && heading.bottom < innerHeight };
    });
    if (state.fits && Math.abs(previousScroll - state.scroll) < 1) { nativeNavigationSettled = true; break; }
    previousScroll = state.scroll;
    await fallbackPage.waitForTimeout(50);
  }
  check(nativeNavigationSettled, 'No-JavaScript services navigation settles with its heading below the header');
  equal(new URL(fallbackPage.url()).hash, '#services', 'No-JavaScript services link still navigates');
  check(await fallbackPage.locator('#portfolioTrack').evaluate(el => {
    const slides = [...el.children];
    return getComputedStyle(el).display === 'grid' && slides.every(slide => !slide.inert && slide.getBoundingClientRect().width <= innerWidth);
  }), 'No-JavaScript projects render as ordinary readable stacked cards');
  check(!(await fallbackPage.locator('.portfolio-controls').isVisible()), 'No-JavaScript hides controls that need scripting');
  await fallbackPage.locator('.creator-copy a[data-enquiry="creator"]').click();
  equal(new URL(fallbackPage.url()).hash, '#talk', 'No-JavaScript Creator enquiry link remains reachable');
  await nojs.close();

  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', timezoneId: 'UTC' });
  await reduced.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const reducedPage = await reduced.newPage();
  reducedPage.on('pageerror', error => errors.push(error.message));
  reducedPage.on('console', message => {
    if (message.type() === 'error' && message.location().url.startsWith(origin)) errors.push(message.text());
  });
  await reducedPage.goto(base + '/?r=global', { waitUntil: 'networkidle' });
  const motion = await reducedPage.evaluate(() => ({
    smooth: getComputedStyle(document.documentElement).scrollBehavior,
    animated: [...document.querySelectorAll('body *')].filter(el => {
      const name = getComputedStyle(el).animationName;
      return name && name !== 'none';
    }).length,
    videoPaused: document.querySelector('#exVideo').paused,
    word: document.querySelector('#rot .on').textContent
  }));
  equal(motion.smooth, 'auto', 'Reduced motion disables smooth scrolling');
  equal(motion.animated, 0, 'Reduced motion disables decorative animations');
  equal(await reducedPage.locator('#product').getAttribute('data-mode'), 'native', 'Reduced motion uses the horizontal fallback without pinning');
  await chooseProject(reducedPage, 1);
  equal(await reducedPage.locator('#portfolioCount').innerText(), '02 / 02', 'Reduced motion can select the Creator project immediately');
  await reducedPage.locator('#exVideo').scrollIntoViewIfNeeded();
  await reducedPage.waitForTimeout(2750);
  equal(await reducedPage.locator('#rot .on').innerText(), motion.word, 'Reduced motion stops the rotating headline');
  check(await reducedPage.locator('#exVideo').evaluate(el => el.paused), 'Reduced motion does not autoplay sample video');
  await reducedPage.locator('.portfolio-bridge a[href="#services"]').click();
  equal(new URL(reducedPage.url()).hash, '#services', 'Reduced motion can leave Our Work using its native section link');
  assert.deepEqual(errors, [], 'No page JavaScript errors'); checks++;
  await reduced.close();
  await context.close();
  console.log(`PASS: ${checks} smoke checks. External fonts are self-hosted; YouTube playback and email application delivery are excluded.`);
} finally { await browser.close(); }
