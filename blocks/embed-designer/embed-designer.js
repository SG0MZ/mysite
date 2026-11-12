import { isSafeUrl, removeWithEmptyParent } from '../../scripts/block-utils.js';

const URL_TEXT = /^https?:\/\/\S+$/i;

/**
 * The embed source: the first link or plain-text URL paragraph in document order, so a
 * later attribution link is never mistaken for it.
 */
function findEmbedSource(block) {
  const candidate = [...block.querySelectorAll('a[href], p, div')].find((el) => {
    if (el.tagName === 'A') return isSafeUrl(el.href);
    return !el.children.length && URL_TEXT.test(el.textContent.trim())
      && isSafeUrl(el.textContent.trim());
  });
  if (!candidate) return null;
  if (candidate.tagName === 'A') {
    return { src: candidate.href, element: candidate, label: candidate.textContent.trim() };
  }
  return { src: candidate.textContent.trim(), element: candidate, label: '' };
}

function loadIframe(frame, source) {
  if (frame.querySelector('iframe')) return;
  const url = new URL(source.src);
  const iframe = document.createElement('iframe');
  iframe.className = 'embed-designer-iframe';
  iframe.src = url.href;
  iframe.title = source.label && !URL_TEXT.test(source.label)
    ? source.label
    : `Content from ${url.hostname}`;
  iframe.loading = 'lazy';
  iframe.allow = 'fullscreen; clipboard-write; camera; geolocation';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.replaceChildren(iframe);
  frame.classList.add('embed-designer-is-loaded');
}

/**
 * Embeds a third-party designer tool (e.g. hover.to) in a tall, full-width iframe that loads
 * when it nears the viewport (or on click when a placeholder image is authored). Any other
 * content (logo, attribution link) renders below the frame.
 */
export default function decorate(block) {
  const source = findEmbedSource(block);
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const sourceCell = source ? cells.find((cell) => cell.contains(source.element)) : null;
  // a placeholder picture belongs with the source link (same cell), else none
  const placeholder = sourceCell?.querySelector('picture') || null;

  const frame = document.createElement('div');
  frame.className = 'embed-designer-frame';
  const attribution = document.createElement('div');
  attribution.className = 'embed-designer-attribution';

  if (source) removeWithEmptyParent(source.element);
  if (placeholder) {
    const parent = placeholder.parentElement;
    placeholder.remove();
    if (parent && parent.tagName === 'P' && !parent.textContent.trim()) parent.remove();
  }

  cells.forEach((cell) => {
    if (cell.textContent.trim() || cell.querySelector('picture, img')) {
      cell.classList.add('embed-designer-attribution-item');
      attribution.append(cell);
    }
  });

  block.replaceChildren(frame);
  if (attribution.children.length) block.append(attribution);

  if (!source) {
    block.classList.add('embed-designer-empty');
    return;
  }

  if (placeholder) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'embed-designer-placeholder';
    button.setAttribute('aria-label', 'Load interactive content');
    button.append(placeholder);
    button.addEventListener('click', () => loadIframe(frame, source));
    frame.append(button);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadIframe(frame, source);
    }
  }, { rootMargin: '300px 0px' });
  observer.observe(block);
}
