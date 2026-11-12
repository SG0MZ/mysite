/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-media-split. Base: tabs.
 * Source: https://www.jameshardie.com/
 * Selector: #main-content > div.w-full.max-w-screen-1440p.m-auto.flex.flex-col > div:has(.textImageItem)
 * Model (xwalk): container of tabs-media-split-item rows:
 *   cell 1: title (text tab label);
 *   cell 2: content_richtext (heading, text, link) + content_image (reference) +
 *           content_video (aem-content link to the mp4).
 * Tab labels (button h4) pair with .textImageItem panels by document order; hidden panels
 * (div.hidden) are included.
 */

function cleanText(el) {
  return (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const labels = [...element.querySelectorAll('button > h1, button > h2, button > h3, button > h4, button > h5, button > h6')];
  const panels = [...element.querySelectorAll('.textImageItem')];

  const cells = [];
  panels.forEach((panel, i) => {
    // cell 1: tab label
    const labelCell = document.createDocumentFragment();
    const labelText = cleanText(labels[i]) || cleanText(panel.querySelector('h1, h2, h3, h4, h5, h6'));
    if (labelText) {
      labelCell.appendChild(document.createComment(' field:title '));
      labelCell.appendChild(document.createTextNode(labelText));
    }

    // cell 2: content (richtext) + media
    const contentCell = document.createDocumentFragment();
    const body = panel.querySelector('.textImageItemBody') || panel;
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    const text = [...body.querySelectorAll(':scope > div, :scope > p')].find((d) => cleanText(d));
    const links = [...body.querySelectorAll('a[href]')];

    const rich = [];
    if (heading) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = cleanText(heading);
      rich.push(h);
    }
    if (text) {
      const blocks = [...text.querySelectorAll(':scope > p, :scope > ul, :scope > ol')];
      if (blocks.length) {
        blocks.forEach((b) => {
          const clone = b.cloneNode(true);
          clone.removeAttribute('class');
          rich.push(clone);
        });
      } else {
        const p = document.createElement('p');
        p.textContent = cleanText(text);
        rich.push(p);
      }
    }
    links.forEach((link) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = cleanText(link);
      p.appendChild(a);
      rich.push(p);
    });
    if (rich.length) {
      contentCell.appendChild(document.createComment(' field:content_richtext '));
      rich.forEach((n) => contentCell.appendChild(n));
    }

    const mediaWrap = panel.querySelector('.textImageItemImage') || panel;
    const video = mediaWrap.querySelector('video');
    const videoSrc = video
      ? (video.getAttribute('src') || video.querySelector('source[src]')?.getAttribute('src') || '').trim()
      : '';
    const posterSrc = (video && video.getAttribute('poster'))
      || mediaWrap.querySelector('img:not([src^="data:"])')?.getAttribute('src');
    // the site's generic player fallback poster is not authored content
    if (posterSrc && !/fallback-[^/]*poster/i.test(posterSrc)) {
      contentCell.appendChild(document.createComment(' field:content_image '));
      const img = document.createElement('img');
      img.src = posterSrc;
      img.alt = heading ? cleanText(heading) : '';
      contentCell.appendChild(img);
    }
    if (videoSrc) {
      contentCell.appendChild(document.createComment(' field:content_video '));
      const a = document.createElement('a');
      a.href = videoSrc;
      a.textContent = videoSrc;
      contentCell.appendChild(a);
    }

    cells.push([labelCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-media-split', cells });
  element.replaceWith(block);
}
