/* eslint-disable */
/* global WebImporter */

/**
 * Parser for embed-designer. Base: embed.
 * Source: https://www.jameshardie.com/
 * Selector: #hover-website-embed
 * Model (xwalk): embed_placeholder (reference) + embed_uri (aem-content) share row 1;
 *   attribution (richtext) is row 2.
 * Row 1: link to the Hover designer iframe URL (no placeholder image in the source).
 * Row 2: attribution logo link (#hover-website-embed-footer-logo).
 */

export default function parse(element, { document }) {
  const iframe = element.querySelector('iframe[src]');
  const embedSrc = iframe ? iframe.getAttribute('src').trim() : '';

  // Row 1: embed URL
  const embedCell = document.createDocumentFragment();
  if (embedSrc) {
    embedCell.appendChild(document.createComment(' field:embed_uri '));
    const a = document.createElement('a');
    a.href = embedSrc;
    a.textContent = embedSrc;
    embedCell.appendChild(a);
  }

  // Row 2: attribution logo link
  const attributionCell = document.createDocumentFragment();
  const footerLink = element.querySelector('#hover-website-embed-footer a[href], #hover-website-embed-footer-logo');
  if (footerLink && footerLink.getAttribute('href')) {
    attributionCell.appendChild(document.createComment(' field:attribution '));
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = footerLink.getAttribute('href');
    const logo = footerLink.querySelector('img');
    const logoSrc = logo ? logo.getAttribute('src') || '' : '';
    const label = footerLink.textContent.replace(/\s+/g, ' ').trim()
      || (logo && logo.getAttribute('alt')) || 'Powered by HOVER';
    if (logoSrc && !logoSrc.startsWith('data:')) {
      const img = document.createElement('img');
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
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-designer', cells });
  element.replaceWith(block);
}
