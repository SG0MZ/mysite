/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-blog-slider. Base: cards.
 * Source: https://www.jameshardie.com/
 * Selector: #main-content div.max-w-screen-1440p.pt-10.pb-12 .splide (#splide03)
 * Model (xwalk): container of cards-blog-slider-card rows:
 *   cell 1: image (reference); cell 2: text (richtext: linked title heading + one paragraph
 *   holding only the category tag links).
 * The card's wrapping <a> (image + title) is rebuilt as a link on the heading.
 */

function cleanInline(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('*').forEach((n) => [...n.attributes].forEach((a) => n.removeAttribute(a.name)));
  return clone.innerHTML.replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const slides = [...element.querySelectorAll('.splide__list > li.splide__slide')]
    .filter((li) => !li.classList.contains('splide__slide--clone'));

  const cells = [];
  slides.forEach((slide) => {
    const card = slide.querySelector(':scope > div') || slide;
    const heading = card.querySelector('.card-title, h1, h2, h3, h4, h5, h6');
    const img = card.querySelector('img:not([src^="data:"])');
    // main card link: the anchor wrapping image/title (falls back to the first non-pill link)
    const mainLink = (heading && heading.closest('a[href]'))
      || (img && img.closest('a[href]'))
      || card.querySelector(':scope > a[href]:not([id^="topic-pill"])');
    const tagLinks = [...card.querySelectorAll('a[id^="topic-pill"][href], a[href*="/blog/"]')]
      .filter((a) => a !== mainLink && !a.contains(heading) && a.textContent.trim());

    // cell 1: image
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      const image = document.createElement('img');
      image.src = img.getAttribute('src');
      image.alt = img.getAttribute('alt') || '';
      imageCell.appendChild(image);
    }

    // cell 2: linked title + category paragraph (links only)
    const nodes = [];
    if (heading) {
      const h = document.createElement(/^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : 'h3');
      const html = cleanInline(heading);
      if (mainLink) {
        const a = document.createElement('a');
        a.href = mainLink.getAttribute('href');
        a.innerHTML = html;
        h.appendChild(a);
      } else {
        h.innerHTML = html;
      }
      nodes.push(h);
    }
    if (tagLinks.length) {
      const p = document.createElement('p');
      tagLinks.forEach((link, i) => {
        if (i) p.appendChild(document.createTextNode(' '));
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = link.textContent.replace(/\s+/g, ' ').trim();
        p.appendChild(a);
      });
      nodes.push(p);
    }

    const textCell = document.createDocumentFragment();
    if (nodes.length) {
      textCell.appendChild(document.createComment(' field:text '));
      nodes.forEach((n) => textCell.appendChild(n));
    }

    if (img || nodes.length) cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-blog-slider', cells });
  element.replaceWith(block);
}
