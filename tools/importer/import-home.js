/* eslint-disable */
/* global WebImporter */

import heroVideoParser from './parsers/hero-video.js';
import carouselHotspotParser from './parsers/carousel-hotspot.js';
import carouselVideoParser from './parsers/carousel-video.js';
import embedDesignerParser from './parsers/embed-designer.js';
import tabsMediaSplitParser from './parsers/tabs-media-split.js';
import cardsSocialGridParser from './parsers/cards-social-grid.js';
import cardsBlogSliderParser from './parsers/cards-blog-slider.js';
import cleanupTransformer from './transformers/jameshardie-cleanup.js';
import sectionsTransformer from './transformers/jameshardie-sections.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://www.jameshardie.com/"
  ],
  "representativeUrl": "https://www.jameshardie.com/",
  "description": "James Hardie homepage: video hero, product hotspot carousel, video carousel, Hover designer embed, tabbed media, social gallery, blog slider and footnotes",
  "blocks": [
    {
      "name": "hero-video",
      "instances": [
        "#main-content > div.hero-video-overlay",
        ".hero-video-overlay"
      ]
    },
    {
      "name": "carousel-hotspot",
      "instances": [
        "#main-content > div.slim .splide",
        "#splide01"
      ]
    },
    {
      "name": "carousel-video",
      "instances": [
        "#main-content > div.max-w-screen-1440p.my-10 .splide",
        "#splide02"
      ]
    },
    {
      "name": "embed-designer",
      "instances": [
        "#hover-website-embed"
      ]
    },
    {
      "name": "tabs-media-split",
      "instances": [
        "#main-content > div.w-full.max-w-screen-1440p.m-auto.flex.flex-col > div:has(.textImageItem)"
      ]
    },
    {
      "name": "cards-social-grid",
      "instances": [
        ".swe_embed[id^=\"sprinklr-embed-\"]",
        ".swe_embed"
      ]
    },
    {
      "name": "cards-blog-slider",
      "instances": [
        "#main-content div.max-w-screen-1440p.pt-10.pb-12 .splide",
        "#splide03"
      ]
    }
  ],
  "urlPattern": "/",
  "sections": [
    {
      "id": "rc2",
      "name": "Hero",
      "selector": [
        "#main-content > div.hero-video-overlay"
      ],
      "style": null,
      "blocks": [
        "hero-video"
      ],
      "defaultContent": []
    },
    {
      "id": "rc3",
      "name": "Explore our products",
      "selector": [
        "#main-content > div.slim"
      ],
      "style": null,
      "blocks": [
        "carousel-hotspot"
      ],
      "defaultContent": [
        "#main-content > div.slim .inner-container.pb-6",
        "#main-content > div.slim > div.relative > div.inner-container:last-child"
      ]
    },
    {
      "id": "rc4",
      "name": "Discover what sets us apart",
      "selector": [
        "#main-content > div.max-w-screen-1440p.my-10"
      ],
      "style": null,
      "blocks": [
        "carousel-video"
      ],
      "defaultContent": [
        "#main-content > div.max-w-screen-1440p.my-10 > div.block.mb-6"
      ]
    },
    {
      "id": "rc5",
      "name": "Hover designer embed",
      "selector": [
        "#main-content > div.base-container-background"
      ],
      "style": null,
      "blocks": [
        "embed-designer"
      ],
      "defaultContent": []
    },
    {
      "id": "rc6",
      "name": "Hardie Designer intro",
      "selector": [
        "#main-content > div.w-full.flex.flex-col.items-center.bg-transparent"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        "#main-content > div.w-full.flex.flex-col.items-center.bg-transparent > div > div"
      ]
    },
    {
      "id": "rc7",
      "name": "Hardie Designer tabs",
      "selector": [
        "#main-content > div.w-full.max-w-screen-1440p.m-auto.flex.flex-col"
      ],
      "style": null,
      "blocks": [
        "tabs-media-split"
      ],
      "defaultContent": []
    },
    {
      "id": "rc8",
      "name": "Social gallery",
      "selector": [
        "#main-content > div.w-full:has(.swe_embed)",
        "#main-content > div.w-full:nth-of-type(8)"
      ],
      "style": "light-grey",
      "blocks": [
        "cards-social-grid"
      ],
      "defaultContent": [
        "#main-content > div.w-full:has(.swe_embed) .inner-container > div.block.pb-8"
      ]
    },
    {
      "id": "rc9",
      "name": "Latest blog posts",
      "selector": [
        "#main-content > div.w-full:has(div.max-w-screen-1440p.pt-10.pb-12)",
        "#main-content > div.w-full:nth-of-type(9)"
      ],
      "style": "beige",
      "blocks": [
        "cards-blog-slider"
      ],
      "defaultContent": [
        "#main-content div.max-w-screen-1440p.pt-10.pb-12 > div.block.pb-8"
      ]
    },
    {
      "id": "rc10",
      "name": "Footnote 1",
      "selector": [
        "#main-content > div.bg-neutral-color-high:nth-of-type(10)"
      ],
      "style": "dark",
      "blocks": [],
      "defaultContent": [
        "#main-content > div.bg-neutral-color-high:nth-of-type(10) .inner-container"
      ]
    },
    {
      "id": "rc11",
      "name": "Footnote 2",
      "selector": [
        "#main-content > div.bg-neutral-color-high:nth-of-type(11)"
      ],
      "style": "dark",
      "blocks": [],
      "defaultContent": [
        "#main-content > div.bg-neutral-color-high:nth-of-type(11) .inner-container"
      ]
    }
  ]
};

const parsers = {
  'hero-video': heroVideoParser,
  'carousel-hotspot': carouselHotspotParser,
  'carousel-video': carouselVideoParser,
  'embed-designer': embedDesignerParser,
  'tabs-media-split': tabsMediaSplitParser,
  'cards-social-grid': cardsSocialGridParser,
  'cards-blog-slider': cardsBlogSliderParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
const transformers = [cleanupTransformer, ...lateTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
