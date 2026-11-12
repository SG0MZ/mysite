/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-video.js
  function parse(element, { document: document2 }) {
    const poster = element.querySelector(".hero-cover img") || element.querySelector(":scope > div > img");
    const video = element.querySelector("video[src], video source[src]");
    const videoSrc = video ? (video.getAttribute("src") || "").trim() : "";
    const mediaCell = document2.createDocumentFragment();
    if (poster) {
      mediaCell.appendChild(document2.createComment(" field:media_image "));
      const img = document2.createElement("img");
      img.src = poster.getAttribute("src");
      img.alt = poster.getAttribute("alt") || "";
      mediaCell.appendChild(img);
    }
    if (videoSrc) {
      mediaCell.appendChild(document2.createComment(" field:media_video "));
      const a = document2.createElement("a");
      a.href = videoSrc;
      a.textContent = videoSrc;
      mediaCell.appendChild(a);
    }
    const textWrap = element.querySelector(":scope > div.flex-col") || element;
    const heading = textWrap.querySelector("h1, h2, h3");
    const subText = [...textWrap.querySelectorAll(":scope > div")].find((d) => !d.querySelector("a, h1, h2, h3") && d.textContent.trim());
    const ctas = [...textWrap.querySelectorAll("a[href]")];
    const textCell = document2.createDocumentFragment();
    if (heading || subText || ctas.length) {
      textCell.appendChild(document2.createComment(" field:text "));
      if (heading) {
        const h = document2.createElement(heading.tagName.toLowerCase());
        h.textContent = heading.textContent.trim();
        textCell.appendChild(h);
      }
      if (subText) {
        const p = document2.createElement("p");
        p.textContent = subText.textContent.trim();
        textCell.appendChild(p);
      }
      ctas.forEach((cta) => {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
        p.appendChild(a);
        textCell.appendChild(p);
      });
    }
    const cells = [[mediaCell], [textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-hotspot.js
  function stylePercent(el, prop) {
    const style = el && el.getAttribute("style") || "";
    const m = style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)%`, "i"));
    return m ? Math.round(parseFloat(m[1])) : null;
  }
  function cleanText(el) {
    return (el ? el.textContent : "").replace(/\s+/g, " ").trim();
  }
  function parse2(element, { document: document2 }) {
    const slides = [...element.querySelectorAll(".splide__list > li.splide__slide")].filter((li) => !li.classList.contains("splide__slide--clone"));
    const cells = [];
    slides.forEach((slide) => {
      const content = slide.querySelector(":scope > div") || slide;
      const img = content.querySelector(":scope > div > img") || content.querySelector('img:not([src^="data:"])');
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:media_image "));
        const image = document2.createElement("img");
        image.src = img.getAttribute("src");
        image.alt = img.getAttribute("alt") || "";
        imageCell.appendChild(image);
      }
      const textCell = document2.createDocumentFragment();
      const pins = [...content.querySelectorAll(":scope > button")];
      const popovers = [...content.querySelectorAll(":scope > div")].filter((d) => d.querySelector("h1, h2, h3, h4, h5, h6"));
      const nodes = [];
      popovers.forEach((popover, i) => {
        const heading = popover.querySelector("h1, h2, h3, h4, h5, h6");
        const desc = popover.querySelector("p");
        const link = popover.querySelector("a[href]");
        if (heading) {
          const h = document2.createElement(heading.tagName.toLowerCase());
          h.innerHTML = heading.innerHTML;
          h.querySelectorAll("*").forEach((n) => [...n.attributes].forEach((a) => n.removeAttribute(a.name)));
          nodes.push(h);
        }
        const pin = pins[i];
        const x = stylePercent(pin, "left");
        const y = stylePercent(pin, "top");
        if (x !== null && y !== null) {
          const pos = document2.createElement("p");
          pos.textContent = `${x}, ${y}`;
          nodes.push(pos);
        }
        if (desc && cleanText(desc)) {
          const p = document2.createElement("p");
          p.textContent = cleanText(desc);
          nodes.push(p);
        }
        if (link) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.href = link.getAttribute("href");
          a.textContent = cleanText(link) || "View product";
          p.appendChild(a);
          nodes.push(p);
        }
      });
      if (nodes.length) {
        textCell.appendChild(document2.createComment(" field:content_text "));
        nodes.forEach((n) => textCell.appendChild(n));
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hotspot", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-video.js
  function parse3(element, { document: document2 }) {
    const slides = [...element.querySelectorAll(".splide__list > li.splide__slide")].filter((li) => !li.classList.contains("splide__slide--clone"));
    const cells = [];
    slides.forEach((slide) => {
      var _a;
      const video = slide.querySelector("video");
      const videoSrc = video ? (video.getAttribute("src") || ((_a = video.querySelector("source[src]")) == null ? void 0 : _a.getAttribute("src")) || "").trim() : "";
      const posterSrc = video ? (video.getAttribute("poster") || "").trim() : "";
      const posterImg = slide.querySelector('img:not([src^="data:"])');
      const heading = slide.querySelector("h1, h2, h3, h4, h5, h6");
      const imageCell = document2.createDocumentFragment();
      const src = posterSrc || posterImg && posterImg.getAttribute("src");
      if (src) {
        imageCell.appendChild(document2.createComment(" field:media_image "));
        const img = document2.createElement("img");
        img.src = src;
        img.alt = posterImg && posterImg.getAttribute("alt") || (heading ? heading.textContent.trim() : "");
        imageCell.appendChild(img);
      }
      const contentCell = document2.createDocumentFragment();
      if (heading) {
        contentCell.appendChild(document2.createComment(" field:content_text "));
        const h = document2.createElement(heading.tagName.toLowerCase());
        h.innerHTML = heading.innerHTML.trim();
        h.querySelectorAll("*").forEach((n) => [...n.attributes].forEach((a) => n.removeAttribute(a.name)));
        contentCell.appendChild(h);
      }
      if (videoSrc) {
        contentCell.appendChild(document2.createComment(" field:content_video "));
        const a = document2.createElement("a");
        a.href = videoSrc;
        a.textContent = videoSrc;
        contentCell.appendChild(a);
      }
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-designer.js
  function parse4(element, { document: document2 }) {
    const iframe = element.querySelector("iframe[src]");
    const embedSrc = iframe ? iframe.getAttribute("src").trim() : "";
    const embedCell = document2.createDocumentFragment();
    if (embedSrc) {
      embedCell.appendChild(document2.createComment(" field:embed_uri "));
      const a = document2.createElement("a");
      a.href = embedSrc;
      a.textContent = embedSrc;
      embedCell.appendChild(a);
    }
    const attributionCell = document2.createDocumentFragment();
    const footerLink = element.querySelector("#hover-website-embed-footer a[href], #hover-website-embed-footer-logo");
    if (footerLink && footerLink.getAttribute("href")) {
      attributionCell.appendChild(document2.createComment(" field:attribution "));
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = footerLink.getAttribute("href");
      const logo = footerLink.querySelector("img");
      const logoSrc = logo ? logo.getAttribute("src") || "" : "";
      const label = footerLink.textContent.replace(/\s+/g, " ").trim() || logo && logo.getAttribute("alt") || "Powered by HOVER";
      if (logoSrc && !logoSrc.startsWith("data:")) {
        const img = document2.createElement("img");
        img.src = logoSrc;
        img.alt = label;
        a.appendChild(img);
      } else {
        a.textContent = label;
      }
      p.appendChild(a);
      attributionCell.appendChild(p);
    }
    const cells = [[embedCell], [attributionCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "embed-designer", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-media-split.js
  function cleanText2(el) {
    return (el ? el.textContent : "").replace(/\s+/g, " ").trim();
  }
  function parse5(element, { document: document2 }) {
    const labels = [...element.querySelectorAll("button > h1, button > h2, button > h3, button > h4, button > h5, button > h6")];
    const panels = [...element.querySelectorAll(".textImageItem")];
    const cells = [];
    panels.forEach((panel, i) => {
      var _a, _b;
      const labelCell = document2.createDocumentFragment();
      const labelText = cleanText2(labels[i]) || cleanText2(panel.querySelector("h1, h2, h3, h4, h5, h6"));
      if (labelText) {
        labelCell.appendChild(document2.createComment(" field:title "));
        labelCell.appendChild(document2.createTextNode(labelText));
      }
      const contentCell = document2.createDocumentFragment();
      const body = panel.querySelector(".textImageItemBody") || panel;
      const heading = body.querySelector("h1, h2, h3, h4, h5, h6");
      const text = [...body.querySelectorAll(":scope > div, :scope > p")].find((d) => cleanText2(d));
      const links = [...body.querySelectorAll("a[href]")];
      const rich = [];
      if (heading) {
        const h = document2.createElement(heading.tagName.toLowerCase());
        h.textContent = cleanText2(heading);
        rich.push(h);
      }
      if (text) {
        const blocks = [...text.querySelectorAll(":scope > p, :scope > ul, :scope > ol")];
        if (blocks.length) {
          blocks.forEach((b) => {
            const clone = b.cloneNode(true);
            clone.removeAttribute("class");
            rich.push(clone);
          });
        } else {
          const p = document2.createElement("p");
          p.textContent = cleanText2(text);
          rich.push(p);
        }
      }
      links.forEach((link) => {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = cleanText2(link);
        p.appendChild(a);
        rich.push(p);
      });
      if (rich.length) {
        contentCell.appendChild(document2.createComment(" field:content_richtext "));
        rich.forEach((n) => contentCell.appendChild(n));
      }
      const mediaWrap = panel.querySelector(".textImageItemImage") || panel;
      const video = mediaWrap.querySelector("video");
      const videoSrc = video ? (video.getAttribute("src") || ((_a = video.querySelector("source[src]")) == null ? void 0 : _a.getAttribute("src")) || "").trim() : "";
      const posterSrc = video && video.getAttribute("poster") || ((_b = mediaWrap.querySelector('img:not([src^="data:"])')) == null ? void 0 : _b.getAttribute("src"));
      if (posterSrc && !/fallback-[^/]*poster/i.test(posterSrc)) {
        contentCell.appendChild(document2.createComment(" field:content_image "));
        const img = document2.createElement("img");
        img.src = posterSrc;
        img.alt = heading ? cleanText2(heading) : "";
        contentCell.appendChild(img);
      }
      if (videoSrc) {
        contentCell.appendChild(document2.createComment(" field:content_video "));
        const a = document2.createElement("a");
        a.href = videoSrc;
        a.textContent = videoSrc;
        contentCell.appendChild(a);
      }
      cells.push([labelCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-media-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-social-grid.js
  function clean(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function captionText(post) {
    var _a;
    const wrapper = post.querySelector(".swe_post_image[alt]");
    const full = wrapper ? wrapper.getAttribute("alt") : "";
    if (full && full.trim()) {
      return full.split(/\n+/).map((l) => l.trim()).filter((l) => l && !/^[.•·-]+$/.test(l)).join(" ");
    }
    return clean((_a = post.querySelector(".swe_post_text")) == null ? void 0 : _a.textContent);
  }
  function parse6(element, { document: document2 }) {
    const posts = [...element.querySelectorAll(".swe_posts .swe_post")];
    const cells = [];
    posts.forEach((post) => {
      var _a, _b, _c;
      const img = post.querySelector('.swe_post_image_container img:not([src^="data:"])');
      let imgSrc = img ? img.getAttribute("src") : "";
      if (!imgSrc) {
        const bg = post.querySelector('.swe_post_image[style*="background-image"]');
        const m = bg && bg.getAttribute("style").match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
        if (m) imgSrc = m[1].replace(/&amp;/g, "&");
      }
      const author = clean((_a = post.querySelector(".swe_post_user_fullname")) == null ? void 0 : _a.textContent);
      const handle = clean((_b = post.querySelector(".swe_post_user_screenname")) == null ? void 0 : _b.textContent);
      const date = clean((_c = post.querySelector(".swe_post_date")) == null ? void 0 : _c.textContent);
      const caption = captionText(post);
      const sourceLink = post.querySelector("a.swe_post_source_link[href], .swe_post_source_link a[href], a.swe_post_channel_icon[href]");
      const href = sourceLink ? sourceLink.getAttribute("href") : "";
      const imageCell = document2.createDocumentFragment();
      if (imgSrc) {
        imageCell.appendChild(document2.createComment(" field:image "));
        const image = document2.createElement("img");
        image.src = imgSrc;
        image.alt = caption ? caption.slice(0, 125) : author ? `Post by ${author}` : "";
        imageCell.appendChild(image);
      }
      const nodes = [];
      if (author) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = author;
        p.appendChild(strong);
        nodes.push(p);
      }
      if (handle) {
        const p = document2.createElement("p");
        p.textContent = handle.startsWith("@") ? handle : `@${handle}`;
        nodes.push(p);
      }
      if (date) {
        const p = document2.createElement("p");
        p.textContent = date;
        nodes.push(p);
      }
      if (caption) {
        const p = document2.createElement("p");
        p.textContent = caption;
        nodes.push(p);
      }
      if (href && /^https?:/i.test(href)) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = "View post";
        p.appendChild(a);
        nodes.push(p);
      }
      const textCell = document2.createDocumentFragment();
      if (nodes.length) {
        textCell.appendChild(document2.createComment(" field:text "));
        nodes.forEach((n) => textCell.appendChild(n));
      }
      if (imgSrc || nodes.length) cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-social-grid", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-blog-slider.js
  function cleanInline(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("*").forEach((n) => [...n.attributes].forEach((a) => n.removeAttribute(a.name)));
    return clone.innerHTML.replace(/\s+/g, " ").trim();
  }
  function parse7(element, { document: document2 }) {
    const slides = [...element.querySelectorAll(".splide__list > li.splide__slide")].filter((li) => !li.classList.contains("splide__slide--clone"));
    const cells = [];
    slides.forEach((slide) => {
      const card = slide.querySelector(":scope > div") || slide;
      const heading = card.querySelector(".card-title, h1, h2, h3, h4, h5, h6");
      const img = card.querySelector('img:not([src^="data:"])');
      const mainLink = heading && heading.closest("a[href]") || img && img.closest("a[href]") || card.querySelector(':scope > a[href]:not([id^="topic-pill"])');
      const tagLinks = [...card.querySelectorAll('a[id^="topic-pill"][href], a[href*="/blog/"]')].filter((a) => a !== mainLink && !a.contains(heading) && a.textContent.trim());
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        const image = document2.createElement("img");
        image.src = img.getAttribute("src");
        image.alt = img.getAttribute("alt") || "";
        imageCell.appendChild(image);
      }
      const nodes = [];
      if (heading) {
        const h = document2.createElement(/^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : "h3");
        const html = cleanInline(heading);
        if (mainLink) {
          const a = document2.createElement("a");
          a.href = mainLink.getAttribute("href");
          a.innerHTML = html;
          h.appendChild(a);
        } else {
          h.innerHTML = html;
        }
        nodes.push(h);
      }
      if (tagLinks.length) {
        const p = document2.createElement("p");
        tagLinks.forEach((link, i) => {
          if (i) p.appendChild(document2.createTextNode(" "));
          const a = document2.createElement("a");
          a.href = link.getAttribute("href");
          a.textContent = link.textContent.replace(/\s+/g, " ").trim();
          p.appendChild(a);
        });
        nodes.push(p);
      }
      const textCell = document2.createDocumentFragment();
      if (nodes.length) {
        textCell.appendChild(document2.createComment(" field:text "));
        nodes.forEach((n) => textCell.appendChild(n));
      }
      if (img || nodes.length) cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-blog-slider", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/jameshardie-cleanup.js
  var CHROME_SELECTORS = [
    // skip link
    'a[href="#main-content"]',
    // announcement banner
    "#announcementBanner",
    // global header + nav
    "header.globalHeader",
    "header",
    "nav.mainNav",
    "nav",
    // off-canvas mobile/search drawer that sits between header and main
    "#__next div.fixed.translate-x-full",
    // footer (sibling of main, not the in-main footnote sections)
    "#main-content ~ div.bg-neutral-color-high",
    "footer",
    // Next.js route announcer
    "next-route-announcer",
    "#__next-route-announcer__",
    // Instagram stories modal
    "#modal-base-stories-modal",
    // OneTrust cookie consent
    "#onetrust-consent-sdk",
    "#onetrust-banner-sdk",
    "#onetrust-pc-sdk",
    ".onetrust-pc-dark-filter",
    "#ot-fltr-modal",
    "iframe.ot-text-resize",
    // chatbot widget
    "#hb_chatbot-root",
    // ad / tracking pixels
    "iframe#universal_pixel_xpmwp4a",
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="adsrvr.org"]',
    '[id^="batBeacon"]',
    '[id^="DfaVisibilityIdentifier"]',
    ".GoogleActiveViewElement",
    'img[src*="arttrk.com"]',
    'img[src*="tags.w55c.net"]',
    'img[src*="abcsinsights.com"]',
    'img[src*="bat.bing.com"]',
    'img[src*="bidr.io"]',
    // non-content elements
    "script",
    "style",
    "noscript",
    "link"
  ];
  var LEFTOVER_SELECTORS = [
    // Weglot re-inserts its switcher while the live page runs, so match it anywhere
    "#weglot-switcher-1",
    ".weglot-container",
    '[id^="weglot"]',
    '[class*="weglot"]',
    ".language-list",
    ".language-option",
    // Hotjar / Facebook helper frames (about:blank) become stray links otherwise
    'iframe[id^="_hjSafeContext"]',
    'iframe[title^="_hj"]',
    'iframe[src="about:blank"]',
    'a[href="about:blank"]',
    "script",
    "style",
    "noscript",
    "link"
  ];
  var MOBILE_ONLY = '[class~="lg:hidden"], [class~="md:hidden"], [class~="sm:hidden"]';
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
    return `${(a.getAttribute("href") || "").trim()}|${(a.textContent || "").replace(/\s+/g, " ").trim()}`;
  }
  function removeMobileDuplicateCtas(root) {
    const links = [...root.querySelectorAll("a[href]")];
    const isMobileOnly = (a) => !!a.closest(MOBILE_ONLY);
    const desktopKeys = new Set(links.filter((a) => !isMobileOnly(a)).map(linkKey));
    links.filter(isMobileOnly).forEach((a) => {
      if (!desktopKeys.has(linkKey(a))) return;
      const wrapper = a.closest(MOBILE_ONLY);
      a.remove();
      let el = wrapper && wrapper !== a ? wrapper : null;
      while (el && el.parentElement && el.id !== "main-content" && !el.textContent.trim() && !el.querySelector("img, picture, video, iframe, table")) {
        const parent = el.parentElement;
        el.remove();
        el = parent;
      }
    });
    root.querySelectorAll("#main-content div.px-4").forEach((div) => {
      if (!div.textContent.trim() && !div.querySelector("img, picture, video, iframe")) div.remove();
    });
  }
  function removeComments(root) {
    const doc = root.ownerDocument || root;
    const walker = doc.createTreeWalker(
      root,
      128
      /* NodeFilter.SHOW_COMMENT */
    );
    const comments = [];
    while (walker.nextNode()) comments.push(walker.currentNode);
    comments.forEach((c) => c.remove());
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      removeAll(element, CHROME_SELECTORS);
      removeMobileDuplicateCtas(element);
      removeComments(element);
    }
    if (hookName === "afterTransform") {
      removeAll(element, LEFTOVER_SELECTORS);
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
        win.setTimeout(() => observer.disconnect(), 3e4);
      }
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const n = attr.name.toLowerCase();
          if (n.startsWith("on") || n.startsWith("data-gtm") || n.startsWith("data-analytics") || n.startsWith("data-track")) {
            el.removeAttribute(attr.name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/jameshardie-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (let i = 0; i < selectors.length; i += 1) {
      const sel = selectors[i];
      if (!sel) continue;
      let el = null;
      try {
        el = root.querySelector(sel);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
    return null;
  }
  function findMarker(root, id) {
    return [...root.querySelectorAll(`hr[${MARKER}]`)].find((hr) => hr.getAttribute(MARKER) === id) || null;
  }
  function insertAtSectionEnd(marker, node) {
    let cursor = marker.nextElementSibling;
    while (cursor && cursor.tagName !== "HR") cursor = cursor.nextElementSibling;
    if (cursor) cursor.before(node);
    else marker.parentElement.append(node);
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el) continue;
        if (i === 0 && !section.style) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (i === 0) hr.setAttribute("data-excat-first-section", "true");
        el.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        const marker = findMarker(element, section.id);
        if (marker) {
          insertAtSectionEnd(marker, metadata);
        } else {
          const el = findSectionElement(element, section);
          if (el) el.after(metadata);
        }
      }
      element.querySelectorAll("hr[data-excat-first-section]").forEach((hr) => hr.remove());
      element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
    }
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
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
          '.swe_embed[id^="sprinklr-embed-"]',
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
  var parsers = {
    "hero-video": parse,
    "carousel-hotspot": parse2,
    "carousel-video": parse3,
    "embed-designer": parse4,
    "tabs-media-split": parse5,
    "cards-social-grid": parse6,
    "cards-blog-slider": parse7
  };
  var sectionTransformers = [transform2];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var transformers = [transform, ...lateTransformers];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document2.querySelectorAll(selector);
      } catch (e) {
        return;
      }
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
  function markPageTargets(payload) {
    const { document: document2, params } = payload;
    executeTransformers("beforeTransform", document2.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document2, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document2.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var import_home_default = {
    preprocess: (payload) => {
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document2.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document: document2, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document2.createElement("hr"));
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document2);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_home_exports);
})();
