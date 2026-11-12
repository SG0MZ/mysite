/*
 * Shared helpers for generated blocks (sliders, video detection, UE instrumentation).
 * Blocks import from /scripts/ rather than from each other.
 */
import { createOptimizedPicture } from './aem.js';

const VIDEO_FILE = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i;
const VIDEO_HOST = /(youtube\.com|youtu\.be|vimeo\.com)/i;
const URL_TEXT = /^https?:\/\/\S+$/i;

/**
 * Move Universal Editor instrumentation (data-aue-*, data-richtext-*) from one element to
 * another. With `to` null, the attributes are only removed.
 */
export function moveInstrumentation(from, to) {
  if (!from) return;
  [...from.attributes]
    .map(({ nodeName }) => nodeName)
    .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-'))
    .forEach((attr) => {
      if (to) to.setAttribute(attr, from.getAttribute(attr));
      from.removeAttribute(attr);
    });
}

/** Strip instrumentation from an element and all its descendants (for clones). */
export function stripInstrumentation(root) {
  if (!root) return root;
  [root, ...root.querySelectorAll('*')].forEach((el) => moveInstrumentation(el, null));
  return root;
}

export function isVideoFile(href) {
  if (!href) return false;
  try {
    return VIDEO_FILE.test(new URL(href, window.location.href).pathname);
  } catch {
    return false;
  }
}

export function isVideoHost(href) {
  return !!href && VIDEO_HOST.test(href);
}

export function isSafeUrl(href) {
  try {
    const url = new URL(href, window.location.href);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Remove an element and its wrapping paragraph when it is the paragraph's only content. */
export function removeWithEmptyParent(el) {
  if (!el) return;
  const parent = el.parentElement;
  el.remove();
  if (parent && parent.matches('p, div.button-container, p.button-wrapper')
    && !parent.textContent.trim() && !parent.querySelector('picture, img, video, iframe')) {
    parent.remove();
  }
}

/**
 * Find a video source inside `root`: a link whose href is a video file (or, with
 * `allowHosts`, a YouTube/Vimeo URL), or a paragraph holding a plain-text video URL.
 * Returns { src, element } or null. `element` is the node holding the reference.
 */
export function findVideo(root, { allowHosts = false } = {}) {
  if (!root) return null;
  const links = [...root.querySelectorAll('a[href]')];
  const link = links.find((a) => isVideoFile(a.href))
    || (allowHosts ? links.find((a) => isVideoHost(a.href)) : null);
  if (link && isSafeUrl(link.href)) return { src: link.href, element: link };
  const para = [...root.querySelectorAll('p, div')]
    .filter((el) => !el.children.length)
    .find((el) => {
      const text = el.textContent.trim();
      return URL_TEXT.test(text) && (isVideoFile(text) || (allowHosts && isVideoHost(text)));
    });
  if (para && isSafeUrl(para.textContent.trim())) {
    return { src: para.textContent.trim(), element: para };
  }
  return null;
}

/**
 * Replace same-origin, non-SVG authored pictures with optimized ones. External images
 * (still pointing at the source site before upload) and SVGs keep the authored picture.
 */
export function optimizePictures(root, width = '750', eager = false) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, eager, [{ width }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Create a muted, looping, inline background video. The source is attached lazily by
 * `playVideo()` so the poster image stays the LCP candidate.
 */
export function createBackgroundVideo(src, poster) {
  const video = document.createElement('video');
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'none');
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');
  if (poster) video.poster = poster;
  video.dataset.src = src;
  return video;
}

/** Try to start a video, attaching its source first. Autoplay rejections are ignored. */
export function playVideo(video) {
  if (!video.getAttribute('src') && video.dataset.src) video.src = video.dataset.src;
  const result = video.play();
  if (result && result.catch) result.catch(() => {});
}

/**
 * Build a pause/play toggle for a video. `isUserPaused()` on the returned object tells the
 * caller whether the visitor explicitly paused, so autoplay logic does not override it.
 */
export function createVideoToggle(video, className, labels = {}) {
  const pauseLabel = labels.pause || 'Pause video';
  const playLabel = labels.play || 'Play video';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  let userPaused = false;

  const sync = () => {
    const playing = !video.paused;
    button.setAttribute('aria-label', playing ? pauseLabel : playLabel);
    button.setAttribute('aria-pressed', String(!playing));
    button.dataset.state = playing ? 'playing' : 'paused';
  };

  button.addEventListener('click', () => {
    if (video.paused) {
      userPaused = false;
      playVideo(video);
    } else {
      userPaused = true;
      video.pause();
    }
  });
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();

  return { button, isUserPaused: () => userPaused };
}

/**
 * Turn a horizontally scrolling track into a slider with prev/next buttons, a progress bar
 * and mouse drag (touch uses native scrolling with scroll-snap). Class names are prefixed
 * with `prefix` so each block's CSS stays scoped to its own class.
 *
 * Creates:
 *   <div class="{prefix}-controls">
 *     <div class="{prefix}-arrows">
 *       <button class="{prefix}-prev"> <button class="{prefix}-next">
 *     </div>
 *     <div class="{prefix}-progress"><span class="{prefix}-progress-bar"></span></div>
 *   </div>
 */
export function createSlider(block, track, { prefix, labels = {} }) {
  const controls = document.createElement('div');
  controls.className = `${prefix}-controls`;
  controls.innerHTML = `
    <div class="${prefix}-arrows">
      <button type="button" class="${prefix}-prev" aria-label="${labels.previous || 'Previous'}"></button>
      <button type="button" class="${prefix}-next" aria-label="${labels.next || 'Next'}"></button>
    </div>
    <div class="${prefix}-progress" aria-hidden="true"><span class="${prefix}-progress-bar"></span></div>`;
  const prev = controls.querySelector(`.${prefix}-prev`);
  const next = controls.querySelector(`.${prefix}-next`);
  const progress = controls.querySelector(`.${prefix}-progress`);

  const step = () => {
    const item = track.firstElementChild;
    if (!item) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return item.getBoundingClientRect().width + gap;
  };

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const scrollable = max > 2;
    controls.hidden = !scrollable;
    block.classList.toggle(`${prefix}-is-static`, !scrollable);
    const left = Math.max(0, Math.min(track.scrollLeft, max));
    prev.disabled = left <= 2;
    next.disabled = left >= max - 2;
    const ratio = track.scrollWidth
      ? Math.min(1, (left + track.clientWidth) / track.scrollWidth)
      : 1;
    progress.style.setProperty('--progress', ratio.toFixed(4));
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', () => window.requestAnimationFrame(update), { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(track);
  window.addEventListener('load', update, { once: true });

  // mouse drag; touch and pen keep native scrolling
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragging = false;
  let moved = false;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true;
    moved = false;
    dragStartX = e.clientX;
    dragStartScroll = track.scrollLeft;
  });
  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    if (!moved && Math.abs(dx) > 5) {
      moved = true;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
    }
    if (moved) track.scrollLeft = dragStartScroll - dx;
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    if (track.hasPointerCapture && track.hasPointerCapture(e.pointerId)) {
      track.releasePointerCapture(e.pointerId);
    }
    track.classList.remove('is-dragging');
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  // a drag must not trigger the click on the link or button it ended on
  track.addEventListener('click', (e) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  }, true);
  track.addEventListener('dragstart', (e) => {
    if (e.target.closest('img, a')) e.preventDefault();
  });

  update();
  return { controls, update };
}

/**
 * Create a modal <dialog> with a close button. Clicking the backdrop or pressing Escape
 * closes it; `onClose` runs after it closes and focus returns to the opener.
 */
export function createModal(className, { closeLabel = 'Close', onClose } = {}) {
  const dialog = document.createElement('dialog');
  dialog.className = className;
  dialog.innerHTML = `<button type="button" class="${className}-close" aria-label="${closeLabel}"></button>
    <div class="${className}-body"></div>`;
  const body = dialog.querySelector(`.${className}-body`);
  let opener = null;
  dialog.querySelector(`.${className}-close`).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (onClose) onClose(body);
    if (opener) opener.focus();
  });
  const open = (trigger) => {
    opener = trigger || document.activeElement;
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute('open', '');
  };
  return { dialog, body, open };
}
