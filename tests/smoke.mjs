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

// Exercise the real local endpoints and assets, including the video range support.
for (const country of ['', 'IN', 'US']) {
  const response = await fetch(base + '/api/geo', { headers: country ? { 'x-vercel-ip-country': country } : {} });
  equal(response.status, 200, 'Geo endpoint is available');
  equal(response.headers.get('cache-control'), 'no-store', 'Geo responses are not cached');
  assert.deepEqual(await response.json(), { country }); checks++;
}
for (const [path, type] of [
  ['/styles.css', 'text/css'], ['/product.css', 'text/css'], ['/landing.css', 'text/css'], ['/app.js', 'javascript'],
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
  check((await page.locator('h1').innerText()).includes('AI automation.'), 'Hero communicates the broad company category');
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
  for (const [name, path, title, kind, output] of [
    ['Audience research', 'audience-research', 'Comments in. Audience insights out.', 'Liquid Signal · product walkthrough', 'A searchable report + CSV / JSON export'],
    ['Creator engine', 'creator-engine', 'Your channel. Your next three ideas.', 'Our creator workflow · illustrated', '3 daily ideas + an edit for your review'],
    ['Business admin', 'enquiry-to-action', 'An enquiry. A clear next step.', 'Illustrative custom workflow', 'An organised task + a draft reply']
  ]) {
    await page.getByRole('button', { name, exact: true }).click();
    equal(await page.locator('#workflowPath').innerText(), '2founders / ' + path, name + ' changes the workflow path');
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

  // Native section links land their chapter and heading below the sticky navigation.
  for (const [target, label] of [
    ['automate', 'What we automate'], ['services', 'Two ways to work with us'],
    ['product', "A product we've shipped"], ['how', 'How it comes together']
  ]) {
    await page.locator('#nav a[href="#' + target + '"]').click();
    await page.waitForFunction(id => {
      const chapter = document.querySelector('#' + id + ' .chapter').getBoundingClientRect();
      const heading = document.querySelector('#' + id + ' h2').getBoundingClientRect();
      return location.hash === '#' + id && chapter.top >= document.querySelector('#nav').getBoundingClientRect().bottom && heading.bottom < innerHeight;
    }, target);
    equal((await page.locator('#' + target + ' .chapter .mono').innerText()).toLowerCase(), label.toLowerCase(), 'Section link exposes the correct chapter');
    check(await page.locator('#' + target + ' h2').isVisible(), 'Section link exposes its heading');
  }

  // Capability prompts help an empty brief while preserving work the visitor has already written.
  const researchCTA = page.locator('#automate a[data-brief]').first();
  const adminCTA = page.locator('#automate a[data-brief]').last();
  await researchCTA.click();
  equal(await page.locator('#enquiryTask').inputValue(), await researchCTA.getAttribute('data-brief'), 'Research prompt pre-fills an empty brief');
  equal(await page.locator('#enquiryType').inputValue(), 'custom', 'Capability prompt selects custom automation');
  const draft = 'Our existing draft: move incoming requests into a reviewed task.';
  await page.locator('#enquiryTask').fill(draft);
  await adminCTA.click();
  equal(await page.locator('#enquiryTask').inputValue(), draft, 'Changing capability preserves the existing draft');

  for (const [service, selector] of [
    ['service', '.offer a[data-enquiry="service"]'],
    ['creator', '.creator-copy a[data-enquiry="creator"]'],
    ['custom', '.offer a[data-enquiry="custom"]']
  ]) {
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

  const faq = page.locator('#faq details').first();
  await faq.locator('summary').click();
  check(await faq.evaluate(el => el.open), 'FAQ opens');
  await faq.locator('summary').click();
  check(!(await faq.evaluate(el => el.open)), 'FAQ closes');

  // Original language choice and company parameters remain available with lazy embeds.
  equal(await page.locator('body').getAttribute('data-region'), 'global', 'Global override is preserved');
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

  for (const width of [320, 390, 701, 720, 740, 768, 1440]) {
    await page.setViewportSize({ width, height: width > 1000 ? 900 : 844 });
    await goto('?r=global');
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
    if (width === 390 || width === 1440) {
      const firstFold = await page.evaluate(() => {
        const fits = selector => {
          const rect = document.querySelector(selector).getBoundingClientRect();
          return rect.top >= document.querySelector('#nav').getBoundingClientRect().bottom && rect.bottom <= innerHeight && rect.left >= 0 && rect.right <= innerWidth;
        };
        return {
          category: fits('.hero-eyebrow') && fits('.hero h1'),
          customCTA: fits('.hero-ctas a[data-enquiry="custom"]'),
          servicesCTA: fits('.hero-ctas a[data-enquiry="service"]'),
          proofBeforeBoard: document.querySelector('.built-strip').getBoundingClientRect().bottom < document.querySelector('.workflow-board').getBoundingClientRect().top
        };
      });
      check(firstFold.category, width + 'px first fold states the automation category');
      check(firstFold.customCTA && firstFold.servicesCTA, width + 'px first fold shows both engagement choices');
      if (width === 390) {
        check(firstFold.proofBeforeBoard, 'Mobile puts shipped proof before the illustrative board');
        equal(await page.locator('#mbar').evaluate(el => getComputedStyle(el).visibility), 'hidden', 'Initial mobile CTA bar is hidden');
        await page.locator('#mbar a').evaluate(el => el.focus());
        check(!(await page.locator('#mbar a').evaluate(el => document.activeElement === el)), 'Hidden mobile CTA cannot take keyboard focus');
      }
      await mkdir(resultsDir, { recursive: true });
      await page.screenshot({ path: resolve(resultsDir, width === 390 ? 'mobile.png' : 'desktop.png'), animations: 'disabled' });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await goto('?r=global');
  await page.locator('#automate').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#mbar').classList.contains('show'));
  equal(await page.locator('#mbar').evaluate(el => getComputedStyle(el).visibility), 'visible', 'Mobile CTA becomes available inside the page');
  await page.locator('#mbar a').evaluate(el => el.focus());
  check(await page.locator('#mbar a').evaluate(el => document.activeElement === el), 'Visible mobile CTA can take keyboard focus');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#mbar')).visibility === 'hidden');
  await page.evaluate(() => document.activeElement.blur());
  await page.locator('#mbar a').evaluate(el => el.focus());
  check(!(await page.locator('#mbar a').evaluate(el => document.activeElement === el)), 'Footer hides the mobile CTA from keyboard focus');
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
  await reducedPage.locator('#exVideo').scrollIntoViewIfNeeded();
  await reducedPage.waitForTimeout(2750);
  equal(await reducedPage.locator('#rot .on').innerText(), motion.word, 'Reduced motion stops the rotating headline');
  check(await reducedPage.locator('#exVideo').evaluate(el => el.paused), 'Reduced motion does not autoplay sample video');
  assert.deepEqual(errors, [], 'No page JavaScript errors'); checks++;
  await reduced.close();
  await context.close();
  console.log(`PASS: ${checks} smoke checks. External fonts are self-hosted; YouTube playback and email application delivery are excluded.`);
} finally { await browser.close(); }
