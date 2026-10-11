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

// Exercise the real local endpoints and assets, including the video range support.
for (const country of ['', 'IN', 'US']) {
  const response = await fetch(base + '/api/geo', { headers: country ? { 'x-vercel-ip-country': country } : {} });
  equal(response.status, 200, 'Geo endpoint is available');
  equal(response.headers.get('cache-control'), 'no-store', 'Geo responses are not cached');
  assert.deepEqual(await response.json(), { country }); checks++;
}
for (const [path, type] of [
  ['/styles.css', 'text/css'], ['/product.css', 'text/css'], ['/landing.css', 'text/css'], ['/experience.css', 'text/css'], ['/app.js', 'javascript'],
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
  equal((await page.locator('#talk-heading').innerText()).replace(/\s+/g, ' '), 'What should we automate for SmokeCompany?', 'Company links personalize the closing question');
  check(await page.locator('#ctaExtra').isHidden(), 'Optional WhatsApp and booking links stay hidden until configured');
  check((await page.locator('.hero .sub').innerText()).includes('two founders'), 'Hero says who is behind the studio');
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
  equal(await page.locator('#workflowNodes .artifact').count(), 4, 'Every default stage shows an illustrated artifact');
  equal(await page.locator('#workflowNodes .node').first().getAttribute('aria-pressed'), 'true', 'The first stage starts selected');
  // A scenario switch must update the complete explanation, rather than only its node labels.
  for (const [name, title, kind, output, artifact] of [
    ['Audience research', 'Comments in. Audience insights out.', 'Liquid Signal · product walkthrough', 'A searchable report + CSV / JSON export', '.art-bars'],
    ['Creator engine', 'Your channel. Your next three ideas.', 'Our creator workflow · illustrated', '3 daily ideas + an edit for your review', '.art-ideas'],
    ['Business admin', 'An enquiry. A clear next step.', 'Illustrative custom workflow', 'An organised task + a draft reply', '.art-approve']
  ]) {
    await page.getByRole('button', { name, exact: true }).click();
    equal(await page.locator('#workflowPath').innerText(), name, name + ' changes the workflow label');
    equal(await page.locator('#workflowTitle').innerText(), title, name + ' changes the title');
    equal(await page.locator('#workflowKind').innerText(), kind, name + ' changes its evidence label');
    equal(await page.locator('#workflowOutput').innerText(), output, name + ' changes the output');
    equal(await page.locator('.scenario-tabs [aria-pressed="true"]').count(), 1, 'One scenario is selected');
    equal(await page.locator('#workflowNodes [aria-pressed="true"]').count(), 1, 'Switching scenario selects one stage');
    equal(await page.locator('#workflowNodes .artifact').count(), 4, name + ' shows one artifact per stage');
    equal(await page.locator('#workflowNodes ' + artifact).count(), 1, name + ' shows its own artifacts');
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
    ['about', 'about-heading', "We're 2 Founders."],
    ['services', 'services-heading', 'Your own automation. Or just the result.'],
    ['product', 'proof-heading', "Two automations we've built."]
  ]) {
    await page.locator('#nav a[href="#' + target + '"]').click();
    await page.waitForFunction(({ target, headingId }) => {
      const heading = document.getElementById(headingId).getBoundingClientRect();
      return location.hash === '#' + target && heading.top >= document.querySelector('#nav').getBoundingClientRect().bottom && heading.bottom < innerHeight;
    }, { target, headingId });
    equal((await page.locator('#' + headingId).innerText()).replace(/\s+/g, ' '), label, 'Section link exposes the correct heading');
    check(await page.locator('#' + headingId).isVisible(), 'Section link exposes its heading');
  }

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

  // The week meter adds up the visitor's own numbers and turns them into a brief without replacing their words.
  await page.locator('#week').scrollIntoViewIfNeeded();
  const weekShows = (id, value) => page.waitForFunction(([id, value]) => document.getElementById(id).textContent === value, [id, value]);
  await weekShows('weekHours', '4');
  equal(await page.locator('#meterTasks .task[aria-pressed="true"]').count(), 2, 'Two example tasks start ticked');
  await page.getByRole('button', { name: 'Copying data between tools', exact: true }).click();
  await page.getByRole('button', { name: 'More hours: Copying data between tools', exact: true }).click();
  await weekShows('weekHours', '7');
  await weekShows('weekYear', '336');
  equal(await page.locator('.wk-slot.is-repeat').count(), 7, 'The week grid fills one slot per hour');
  await page.getByRole('button', { name: 'Fewer hours: Copying data between tools', exact: true }).click();
  await page.getByRole('button', { name: 'Answering the same enquiries', exact: true }).click();
  await weekShows('weekHours', '4');
  check((await page.locator('#weekMsg').innerText()).startsWith('4 hours of your week'), 'Week message reflects the estimate');
  await page.locator('#handOff').click();
  equal(await page.locator('#handOff').getAttribute('aria-pressed'), 'true', 'Hand-off view can be toggled');
  equal(await page.locator('.wk-slot.is-handed').count(), 4, 'Handed-off hours change colour');
  await page.locator('#enquiryTask').fill('');
  await page.locator('#weekBrief').click();
  equal(await page.locator('#enquiryType').inputValue(), 'explore', 'Week brief asks for help choosing an approach');
  const weekBrief = await page.locator('#enquiryTask').inputValue();
  check(weekBrief.includes('Copying data between tools: about 2h a week') && weekBrief.includes('roughly 4 hours a week'), 'Week brief lists the ticked tasks and total');
  check(!weekBrief.includes('Answering the same enquiries'), 'Unticked tasks stay out of the brief');
  await page.locator('#enquiryTask').fill('My own words first.');
  await page.locator('#weekBrief').click();
  const appended = await page.locator('#enquiryTask').inputValue();
  check(appended.startsWith('My own words first.') && appended.includes('Copying data between tools'), 'Week brief is added below what the visitor wrote');

  equal(await page.locator('#faq details').count(), 6, 'FAQ answers the main buying questions');
  const faq = page.locator('#faq details').first();
  check(await faq.locator('summary').isVisible(), 'FAQ questions are visible without opening a drawer');
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
  await page.locator('#work > summary').click();
  await page.waitForFunction(() => !document.querySelector('#work iframe'));
  equal(await page.locator('#work iframe').count(), 0, 'Closing the video drawer stops playback');
  await goto('?region=india&company=AliasCompany');
  equal(await page.locator('body').getAttribute('data-region'), 'in', 'Legacy region alias is preserved');
  equal(await page.locator('#forName').innerText(), 'AliasCompany', 'Legacy company alias is preserved');
  await goto('?r=global&c=' + encodeURIComponent('<img src=x onerror=alert(1)>'));
  equal(await page.locator('#forName img').count(), 0, 'Company personalization is inserted as text');
  equal(await page.locator('#talk-heading img').count(), 0, 'Personalized closing question is inserted as text');

  // The guided experience: the board plays in view, the tour narrates each chapter, and the guide tracks progress.
  await goto('?r=global&c=SmokeCompany');
  equal(await page.locator('#walkthrough').getAttribute('aria-pressed'), 'false', 'The board waits until it is on screen');
  await page.locator('#workflowBoard').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#walkthrough').getAttribute('aria-pressed') === 'true');
  await page.waitForFunction(() => document.querySelector('#workflowNodes [data-step="1"]').getAttribute('aria-pressed') === 'true');
  await page.locator('#workflowNodes button').nth(3).click();
  equal(await page.locator('#walkthrough').getAttribute('aria-pressed'), 'false', 'Choosing a stage stops autoplay');
  await page.waitForTimeout(2800);
  equal(await page.locator('#workflowNodes [aria-pressed="true"]').getAttribute('data-step'), '3', 'Autoplay stays stopped after a manual choice');
  equal(await page.locator('#workflowNodes .is-done').count(), 3, 'Earlier stages show as done');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.locator('#tourStart').click();
  check(await page.locator('#tour').isVisible(), 'The tour opens');
  equal(await page.locator('#tourCount').innerText(), '01 / 06', 'The tour starts at the first chapter');
  check(await page.locator('#tourBack').isDisabled(), 'The first tour step has nowhere to go back to');
  check((await page.locator('#tourLive').textContent()).startsWith('Hi, SmokeCompany team.'), 'The tour greets a personalized visitor');
  equal(await page.locator('#walkthrough').getAttribute('aria-pressed'), 'true', 'The tour starts the workflow walkthrough');
  await page.locator('#tourNext').click();
  equal(await page.locator('#tourCount').innerText(), '02 / 06', 'The tour moves to the next chapter');
  equal(await page.locator('#tourTitle').innerText(), 'Your turn', 'The tour narrates the week meter');
  await page.waitForFunction(() => Math.abs(document.querySelector('#week').getBoundingClientRect().top - 100) < 40);
  await page.locator('#tourPlay').click();
  equal(await page.locator('#tourPlay').getAttribute('aria-pressed'), 'false', 'The tour can be paused');
  await page.keyboard.press('Escape');
  check(await page.locator('#tour').isHidden(), 'Escape closes the tour');
  equal(await page.evaluate(() => document.activeElement.id), 'tourStart', 'Closing the tour returns focus to its button');
  await page.evaluate(() => window.scrollTo({ top: document.querySelector('#about').getBoundingClientRect().top + scrollY - 80, behavior: 'instant' }));
  await page.waitForFunction(() => document.querySelector('#guideLabel').textContent === 'Who we are');
  check(await page.locator('#guide').evaluate(el => el.classList.contains('show')), 'The chapter guide appears after the hero');
  equal(await page.locator('#guideCount').innerText(), '03/06', 'The guide counts chapters');
  await page.locator('#guideToggle').click();
  equal(await page.locator('#guideChapters a').count(), 6, 'The guide lists every chapter');
  check((await page.locator('#guideChapters a[aria-current="true"]').textContent()).includes('Who we are'), 'The guide marks the current chapter');
  await page.keyboard.press('Escape');
  check(await page.locator('#guideMenu').isHidden(), 'Escape closes the guide menu');
  await page.evaluate(() => window.scrollTo({ top: document.querySelector('#aboutPath').getBoundingClientRect().top + scrollY - innerHeight * 0.3, behavior: 'instant' }));
  await page.waitForFunction(() => document.querySelectorAll('#aboutPath .is-reached').length > 0);
  check(Number(await page.locator('#aboutPath').evaluate(el => el.style.getPropertyValue('--p'))) > 0, 'The founders’ story path fills in as it scrolls');
  await page.locator('#processBoard').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => !document.querySelector('#processStatus').textContent.includes('Waiting'));
  check(await page.locator('#processSteps .lit').count() > 0, 'The process playhead lights steps as it scrolls');
  await context.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'IN' });
  await goto('');
  await page.waitForFunction(() => document.body.dataset.region === 'in');
  equal(await page.locator('body').getAttribute('data-region'), 'in', 'Geo detection selects Hindi examples');
  await context.setExtraHTTPHeaders({});

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
        equal(await page.locator('#workflowNodes .artifact:visible').count(), 1, 'Mobile board expands only the active stage');
        check(await page.locator('#guide').isHidden(), 'Mobile relies on the bottom bar instead of the chapter guide');
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
  await fallbackPage.waitForFunction(() => location.hash === '#services' && document.querySelector('#services-heading').getBoundingClientRect().top >= document.querySelector('#nav').getBoundingClientRect().bottom);
  equal(new URL(fallbackPage.url()).hash, '#services', 'No-JavaScript services link still navigates');
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
  await reducedPage.locator('#workflowBoard').scrollIntoViewIfNeeded();
  await reducedPage.locator('#exVideo').scrollIntoViewIfNeeded();
  await reducedPage.waitForTimeout(2750);
  equal(await reducedPage.locator('#rot .on').innerText(), motion.word, 'Reduced motion stops the rotating headline');
  check(await reducedPage.locator('#exVideo').evaluate(el => el.paused), 'Reduced motion does not autoplay sample video');
  equal(await reducedPage.locator('#walkthrough').getAttribute('aria-pressed'), 'false', 'Reduced motion does not autoplay the workflow board');
  equal(await reducedPage.locator('#aboutPath .is-reached').count(), 4, 'Reduced motion shows the whole story path at once');
  equal(await reducedPage.locator('#processStatus').innerText(), '✓ Up and running', 'Reduced motion shows the finished process');
  await reducedPage.locator('#tourStart').click();
  equal(await reducedPage.locator('#tourPlay').getAttribute('aria-pressed'), 'false', 'Reduced motion tour waits for Next');
  check((await reducedPage.locator('#tourText').innerText()).length > 40, 'Reduced motion tour shows its full text at once');
  await reducedPage.keyboard.press('Escape');
  assert.deepEqual(errors, [], 'No page JavaScript errors'); checks++;
  await reduced.close();
  await context.close();
  console.log(`PASS: ${checks} smoke checks. External fonts are self-hosted; YouTube playback and email application delivery are excluded.`);
} finally { await browser.close(); }
