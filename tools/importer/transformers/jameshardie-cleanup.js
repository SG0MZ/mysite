/* eslint-disable */
/* global WebImporter */

/**
 * James Hardie site cleanup.
 *
 * Selectors are taken from migration-work/cleaned.html (https://www.jameshardie.com/).
 *
 * beforeTransform: remove chrome and widgets that could confuse block matching
 *   (skip link, announcement banner, global header/nav, off-canvas drawer, footer,
 *   stories modal, OneTrust cookie banner, chatbot, tracking pixels) and drop
 *   mobile-only CTA links that duplicate a desktop CTA.
 * afterTransform: remove the Weglot language switcher (kept until now because the
 *   section selectors in page-templates.json count it in :nth-of-type) and any
 *   leftover non-authorable elements.
 */

const CHROME_SELECTORS = [
  // skip link
  'a[href="#main-content"]',
  // announcement banner
  '#announcementBanner',
  // global header + nav
  'header.globalHeader',
  'header',
  'nav.mainNav',
  'nav',
  // off-canvas mobile/search drawer that sits between header and main
  '#__next div.fixed.translate-x-full',
  // footer (sibling of main, not the in-main footnote sections)
  '#main-content ~ div.bg-neutral-color-high',
  'footer',
  // Next.js route announcer
  'next-route-announcer',
  '#__next-route-announcer__',
  // Instagram stories modal
  '#modal-base-stories-modal',
  // OneTrust cookie consent
  '#onetrust-consent-sdk',
  '#onetrust-banner-sdk',
  '#onetrust-pc-sdk',
  '.onetrust-pc-dark-filter',
  '#ot-fltr-modal',
  'iframe.ot-text-resize',
  // chatbot widget
  '#hb_chatbot-root',
  // ad / tracking pixels
  'iframe#universal_pixel_xpmwp4a',
  'iframe[src*="doubleclick.net"]',
  'iframe[src*="adsrvr.org"]',
  '[id^="batBeacon"]',
  '[id^="DfaVisibilityIdentifier"]',
  '.GoogleActiveViewElement',
  'img[src*="arttrk.com"]',
  'img[src*="tags.w55c.net"]',
  'img[src*="abcsinsights.com"]',
  'img[src*="bat.bing.com"]',
  'img[src*="bidr.io"]',
  // non-content elements
  'script',
  'style',
  'noscript',
  'link',
];

const LEFTOVER_SELECTORS = [
  // Weglot re-inserts its switcher while the live page runs, so match it anywhere
  '#weglot-switcher-1',
  '.weglot-container',
  '[id^="weglot"]',
  '[class*="weglot"]',
  '.language-list',
  '.language-option',
  // Hotjar / Facebook helper frames (about:blank) become stray links otherwise
  'iframe[id^="_hjSafeContext"]',
  'iframe[title^="_hj"]',
  'iframe[src="about:blank"]',
  'a[href="about:blank"]',
  'script',
  'style',
  'noscript',
  'link',
];

const MOBILE_ONLY = '[class~="lg:hidden"], [class~="md:hidden"], [class~="sm:hidden"]';

function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    let nodes = [];
    try {
      nodes = [...root.querySelectorAll(sel)];
    } catch (e) {
      nodes = [];
    }
    nodes.forEach((n) => n.remove());
  });
}

function linkKey(a) {
  return `${(a.getAttribute('href') || '').trim()}|${(a.textContent || '').replace(/\s+/g, ' ').trim()}`;
}

/**
 * Remove links that are only visible on mobile and repeat a desktop-visible link
 * (same href and text). Empty mobile-only wrappers left behind are removed too.
 */
function removeMobileDuplicateCtas(root) {
  const links = [...root.querySelectorAll('a[href]')];
  const isMobileOnly = (a) => !!a.closest(MOBILE_ONLY);
  const desktopKeys = new Set(links.filter((a) => !isMobileOnly(a)).map(linkKey));

  links.filter(isMobileOnly).forEach((a) => {
    if (!desktopKeys.has(linkKey(a))) return;
    const wrapper = a.closest(MOBILE_ONLY);
    a.remove();
    // remove now-empty wrappers (mobile-only container and its empty parents)
    let el = wrapper && wrapper !== a ? wrapper : null;
    while (el && el.parentElement && el.id !== 'main-content'
      && !el.textContent.trim() && !el.querySelector('img, picture, video, iframe, table')) {
      const parent = el.parentElement;
      el.remove();
      el = parent;
    }
  });

  // "Why choose James Hardie?" mobile copy lives in a plain wrapper
  root.querySelectorAll('#main-content div.px-4').forEach((div) => {
    if (!div.textContent.trim() && !div.querySelector('img, picture, video, iframe')) div.remove();
  });
}

function removeComments(root) {
  const doc = root.ownerDocument || root;
  const walker = doc.createTreeWalker(root, 128 /* NodeFilter.SHOW_COMMENT */);
  const comments = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach((c) => c.remove());
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    removeAll(element, CHROME_SELECTORS);
    removeMobileDuplicateCtas(element);
    // Source-page comments only; parsers have not written field hints yet.
    removeComments(element);
  }

  if (hookName === 'afterTransform') {
    removeAll(element, LEFTOVER_SELECTORS);
    // Weglot's live script re-inserts its switcher after the body is rebuilt, which can
    // land after this hook. Keep removing it until the page is serialized.
    const win = (element.ownerDocument || element).defaultView;
    if (win && win.MutationObserver) {
      const WEGLOT = '[id^="weglot"], [class*="weglot"], .language-list, .language-option, [data-wg-notranslate]';
      const observer = new win.MutationObserver((records) => {
        records.forEach((r) => r.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          if (n.matches(WEGLOT)) n.remove();
          else n.querySelectorAll(WEGLOT).forEach((x) => x.remove());
        }));
      });
      observer.observe(element, { childList: true, subtree: true });
      win.setTimeout(() => observer.disconnect(), 30000);
    }
    // strip any leftover tracking/inline-handler attributes
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name.toLowerCase();
        if (n.startsWith('on') || n.startsWith('data-gtm') || n.startsWith('data-analytics')
          || n.startsWith('data-track')) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}
