/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-hotspot. Base: carousel.
 * Source: https://www.jameshardie.com/
 * Selector: #main-content > div.slim .splide (#splide01)
 * Model (xwalk): container of carousel-hotspot-item rows:
 *   cell 1: media_image (reference); cell 2: content_text (richtext).
 * Hotspot cell: per hotspot a heading, an optional "x, y" position paragraph (only when the
 * source pin carries top/left percentages), the color/description paragraph and the link.
 * All popovers are captured, including the ones hidden (opacity-0/invisible) in the source.
 */

// read a percentage value from an inline style property (e.g. "left: 40%")
function stylePercent(el, prop) {
  const style = (el && el.getAttribute('style')) || '';
  const m = style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)%`, 'i'));
  return m ? Math.round(parseFloat(m[1])) : null;
}

function cleanText(el) {
  return (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const slides = [...element.querySelectorAll('.splide__list > li.splide__slide')]
    .filter((li) => !li.classList.contains('splide__slide--clone'));

  const cells = [];
  slides.forEach((slide) => {
    const content = slide.querySelector(':scope > div') || slide;
    const img = content.querySelector(':scope > div > img') || content.querySelector('img:not([src^="data:"])');

    // cell 1: slide image
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:media_image '));
      const image = document.createElement('img');
      image.src = img.getAttribute('src');
      image.alt = img.getAttribute('alt') || '';
      imageCell.appendChild(image);
    }

    // cell 2: hotspots - pair each pin button with the popover that follows it
    const textCell = document.createDocumentFragment();
    const pins = [...content.querySelectorAll(':scope > button')];
    const popovers = [...content.querySelectorAll(':scope > div')]
      .filter((d) => d.querySelector('h1, h2, h3, h4, h5, h6'));

    const nodes = [];
    popovers.forEach((popover, i) => {
      const heading = popover.querySelector('h1, h2, h3, h4, h5, h6');
      const desc = popover.querySelector('p');
      const link = popover.querySelector('a[href]');

      if (heading) {
        const h = document.createElement(heading.tagName.toLowerCase());
        h.innerHTML = heading.innerHTML;
        h.querySelectorAll('*').forEach((n) => [...n.attributes].forEach((a) => n.removeAttribute(a.name)));
        nodes.push(h);
      }

      // optional position line from the pin's inline style (percent of image)
      const pin = pins[i];
      const x = stylePercent(pin, 'left');
      const y = stylePercent(pin, 'top');
      if (x !== null && y !== null) {
        const pos = document.createElement('p');
        pos.textContent = `${x}, ${y}`;
        nodes.push(pos);
      }

      if (desc && cleanText(desc)) {
        const p = document.createElement('p');
        p.textContent = cleanText(desc);
        nodes.push(p);
      }
      if (link) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = cleanText(link) || 'View product';
        p.appendChild(a);
        nodes.push(p);
      }
    });

    if (nodes.length) {
      textCell.appendChild(document.createComment(' field:content_text '));
      nodes.forEach((n) => textCell.appendChild(n));
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hotspot', cells });
  element.replaceWith(block);
}
