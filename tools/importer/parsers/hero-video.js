/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-video. Base: hero.
 * Source: https://www.jameshardie.com/
 * Selector: #main-content > div.hero-video-overlay
 * Model (xwalk): media_image (reference) + media_video (aem-content) share row 1,
 *   text (richtext) is row 2.
 * Row 1: poster image + link to the .mp4 video file.
 * Row 2: H1, subheading paragraph, CTA link.
 */
export default function parse(element, { document }) {
  // Row 1: poster image and video link (media_ group)
  const poster = element.querySelector('.hero-cover img') || element.querySelector(':scope > div > img');
  const video = element.querySelector('video[src], video source[src]');
  const videoSrc = video ? (video.getAttribute('src') || '').trim() : '';

  const mediaCell = document.createDocumentFragment();
  if (poster) {
    mediaCell.appendChild(document.createComment(' field:media_image '));
    const img = document.createElement('img');
    img.src = poster.getAttribute('src');
    img.alt = poster.getAttribute('alt') || '';
    mediaCell.appendChild(img);
  }
  if (videoSrc) {
    mediaCell.appendChild(document.createComment(' field:media_video '));
    const a = document.createElement('a');
    a.href = videoSrc;
    a.textContent = videoSrc;
    mediaCell.appendChild(a);
  }

  // Row 2: heading, subheading, CTA (text)
  const textWrap = element.querySelector(':scope > div.flex-col') || element;
  const heading = textWrap.querySelector('h1, h2, h3');
  const subText = [...textWrap.querySelectorAll(':scope > div')]
    .find((d) => !d.querySelector('a, h1, h2, h3') && d.textContent.trim());
  const ctas = [...textWrap.querySelectorAll('a[href]')];

  const textCell = document.createDocumentFragment();
  if (heading || subText || ctas.length) {
    textCell.appendChild(document.createComment(' field:text '));
    if (heading) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = heading.textContent.trim();
      textCell.appendChild(h);
    }
    if (subText) {
      const p = document.createElement('p');
      p.textContent = subText.textContent.trim();
      textCell.appendChild(p);
    }
    ctas.forEach((cta) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
      p.appendChild(a);
      textCell.appendChild(p);
    });
  }

  const cells = [[mediaCell], [textCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
