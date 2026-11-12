/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-video. Base: carousel.
 * Source: https://www.jameshardie.com/
 * Selector: #main-content > div.max-w-screen-1440p.my-10 .splide (#splide02)
 * Model (xwalk): container of carousel-video-item rows:
 *   cell 1: media_image (reference, poster - from <video poster> when the source has one);
 *   cell 2: content_text (richtext title) + content_video (aem-content link to the mp4).
 * The source only renders <video> elements (no poster img; the visible img is a data: play icon).
 */

export default function parse(element, { document }) {
  const slides = [...element.querySelectorAll('.splide__list > li.splide__slide')]
    .filter((li) => !li.classList.contains('splide__slide--clone'));

  const cells = [];
  slides.forEach((slide) => {
    const video = slide.querySelector('video');
    const videoSrc = video
      ? (video.getAttribute('src') || video.querySelector('source[src]')?.getAttribute('src') || '').trim()
      : '';
    const posterSrc = video ? (video.getAttribute('poster') || '').trim() : '';
    const posterImg = slide.querySelector('img:not([src^="data:"])');
    const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');

    // cell 1: poster image
    const imageCell = document.createDocumentFragment();
    const src = posterSrc || (posterImg && posterImg.getAttribute('src'));
    if (src) {
      imageCell.appendChild(document.createComment(' field:media_image '));
      const img = document.createElement('img');
      img.src = src;
      img.alt = (posterImg && posterImg.getAttribute('alt')) || (heading ? heading.textContent.trim() : '');
      imageCell.appendChild(img);
    }

    // cell 2: title + video link
    const contentCell = document.createDocumentFragment();
    if (heading) {
      contentCell.appendChild(document.createComment(' field:content_text '));
      const h = document.createElement(heading.tagName.toLowerCase());
      h.innerHTML = heading.innerHTML.trim();
      h.querySelectorAll('*').forEach((n) => [...n.attributes].forEach((a) => n.removeAttribute(a.name)));
      contentCell.appendChild(h);
    }
    if (videoSrc) {
      contentCell.appendChild(document.createComment(' field:content_video '));
      const a = document.createElement('a');
      a.href = videoSrc;
      a.textContent = videoSrc;
      contentCell.appendChild(a);
    }

    cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-video', cells });
  element.replaceWith(block);
}
