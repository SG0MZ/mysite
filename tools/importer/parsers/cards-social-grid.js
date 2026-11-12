/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-social-grid. Base: cards.
 * Source: https://www.jameshardie.com/
 * Selector: .swe_embed[id^="sprinklr-embed-"]
 * Model (xwalk): container of cards-social-grid-card rows:
 *   cell 1: image (reference); cell 2: text (richtext: author, @handle, date, caption, link).
 * Static snapshot of the Sprinklr widget posts rendered at import time (.swe_post).
 * The full caption is read from the image wrapper's alt attribute (the visible
 * .swe_post_text is truncated with "...").
 */

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

// caption lines without the "." spacer lines Instagram captions use
function captionText(post) {
  const wrapper = post.querySelector('.swe_post_image[alt]');
  const full = wrapper ? wrapper.getAttribute('alt') : '';
  if (full && full.trim()) {
    return full.split(/\n+/).map((l) => l.trim()).filter((l) => l && !/^[.•·-]+$/.test(l)).join(' ');
  }
  return clean(post.querySelector('.swe_post_text')?.textContent);
}

export default function parse(element, { document }) {
  const posts = [...element.querySelectorAll('.swe_posts .swe_post')];

  const cells = [];
  posts.forEach((post) => {
    const img = post.querySelector('.swe_post_image_container img:not([src^="data:"])');
    // the live widget paints the post image as a CSS background on .swe_post_image
    let imgSrc = img ? img.getAttribute('src') : '';
    if (!imgSrc) {
      const bg = post.querySelector('.swe_post_image[style*="background-image"]');
      const m = bg && bg.getAttribute('style').match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (m) imgSrc = m[1].replace(/&amp;/g, '&');
    }
    const author = clean(post.querySelector('.swe_post_user_fullname')?.textContent);
    const handle = clean(post.querySelector('.swe_post_user_screenname')?.textContent);
    const date = clean(post.querySelector('.swe_post_date')?.textContent);
    const caption = captionText(post);
    const sourceLink = post.querySelector('a.swe_post_source_link[href], .swe_post_source_link a[href], a.swe_post_channel_icon[href]');
    const href = sourceLink ? sourceLink.getAttribute('href') : '';

    // cell 1: post image
    const imageCell = document.createDocumentFragment();
    if (imgSrc) {
      imageCell.appendChild(document.createComment(' field:image '));
      const image = document.createElement('img');
      image.src = imgSrc;
      image.alt = caption ? caption.slice(0, 125) : (author ? `Post by ${author}` : '');
      imageCell.appendChild(image);
    }

    // cell 2: author, handle, date, caption, link
    const nodes = [];
    if (author) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = author;
      p.appendChild(strong);
      nodes.push(p);
    }
    if (handle) {
      const p = document.createElement('p');
      p.textContent = handle.startsWith('@') ? handle : `@${handle}`;
      nodes.push(p);
    }
    if (date) {
      const p = document.createElement('p');
      p.textContent = date;
      nodes.push(p);
    }
    if (caption) {
      const p = document.createElement('p');
      p.textContent = caption;
      nodes.push(p);
    }
    if (href && /^https?:/i.test(href)) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = 'View post';
      p.appendChild(a);
      nodes.push(p);
    }

    const textCell = document.createDocumentFragment();
    if (nodes.length) {
      textCell.appendChild(document.createComment(' field:text '));
      nodes.forEach((n) => textCell.appendChild(n));
    }

    if (imgSrc || nodes.length) cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-social-grid', cells });
  element.replaceWith(block);
}
