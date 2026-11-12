import {
  createSlider,
  moveInstrumentation,
  optimizePictures,
} from '../../scripts/block-utils.js';

// "40, 60" / "40% 60%" / "40/60": hotspot position as x, y percentages of the image
const POSITION = /^\s*(\d{1,3}(?:\.\d+)?)\s*%?\s*[,/x ]\s*(\d{1,3}(?:\.\d+)?)\s*%?\s*$/i;
const DEFAULT_POSITIONS = [[50, 50], [30, 65], [70, 35], [40, 25], [65, 75]];

let blockCount = 0;

function clamp(value) {
  return Math.min(95, Math.max(5, value));
}

/**
 * Split a slide's text cell into hotspot groups. A heading starts a new hotspot; content
 * before the first heading (or a cell without headings) forms one hotspot.
 */
function groupHotspots(cell) {
  // bare text in a cell (no block-level children) becomes a paragraph
  if (!cell.children.length && cell.textContent.trim()) {
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    cell.append(p);
  }
  const groups = [];
  let current = null;
  [...cell.children].forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName) || !current) {
      current = [];
      groups.push(current);
    }
    current.push(el);
  });
  return groups.filter((group) => group.some((el) => el.textContent.trim()));
}

function closeAll(block, except) {
  block.querySelectorAll('.carousel-hotspot-pin[aria-expanded="true"]').forEach((pin) => {
    if (pin === except) return;
    pin.setAttribute('aria-expanded', 'false');
    const popover = block.querySelector(`#${pin.getAttribute('aria-controls')}`);
    if (popover) popover.hidden = true;
  });
}

function buildHotspot(block, group, index, id) {
  const hotspot = document.createElement('div');
  hotspot.className = 'carousel-hotspot-hotspot';

  // an authored position paragraph is consumed, otherwise fall back to a default spread
  let [x, y] = DEFAULT_POSITIONS[index % DEFAULT_POSITIONS.length];
  const positionEl = group.find((el) => el.tagName === 'P' && POSITION.test(el.textContent));
  if (positionEl) {
    const [, px, py] = positionEl.textContent.match(POSITION);
    x = clamp(parseFloat(px));
    y = clamp(parseFloat(py));
    positionEl.remove();
  }
  hotspot.style.setProperty('--hotspot-x', `${x}%`);
  hotspot.style.setProperty('--hotspot-y', `${y}%`);
  if (x > 55) hotspot.classList.add('carousel-hotspot-hotspot-left');
  if (y > 55) hotspot.classList.add('carousel-hotspot-hotspot-above');

  const popover = document.createElement('div');
  popover.className = 'carousel-hotspot-popover';
  popover.id = id;
  popover.hidden = true;
  popover.setAttribute('role', 'group');
  group.filter((el) => el.isConnected).forEach((el) => popover.append(el));
  popover.querySelector('a')?.classList.add('carousel-hotspot-link');

  const name = popover.querySelector('h1, h2, h3, h4, h5, h6')?.textContent.trim()
    || popover.textContent.trim().split('\n')[0];
  popover.setAttribute('aria-label', name);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'carousel-hotspot-popover-close';
  close.setAttribute('aria-label', 'Close');
  popover.prepend(close);

  const pin = document.createElement('button');
  pin.type = 'button';
  pin.className = 'carousel-hotspot-pin';
  pin.setAttribute('aria-expanded', 'false');
  pin.setAttribute('aria-controls', id);
  pin.setAttribute('aria-label', `Show details: ${name}`);

  pin.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = pin.getAttribute('aria-expanded') !== 'true';
    closeAll(block, pin);
    pin.setAttribute('aria-expanded', String(open));
    popover.hidden = !open;
  });
  close.addEventListener('click', (e) => {
    e.stopPropagation();
    pin.setAttribute('aria-expanded', 'false');
    popover.hidden = true;
    pin.focus();
  });
  popover.addEventListener('click', (e) => e.stopPropagation());

  hotspot.append(pin, popover);
  return hotspot;
}

function createSlide(block, row, slideIndex) {
  const slide = document.createElement('li');
  slide.className = 'carousel-hotspot-slide';
  moveInstrumentation(row, slide);

  const cells = [...row.children];
  const imageCell = cells.find((cell) => cell.querySelector('picture'));
  if (imageCell) {
    imageCell.className = 'carousel-hotspot-slide-image';
    slide.append(imageCell);
  }

  // every other cell holds hotspot content; the cell stays as the (instrumented) layer
  cells.filter((cell) => cell !== imageCell).forEach((cell) => {
    // a stray picture in a text cell belongs to the image, not to a hotspot
    if (!imageCell) {
      const pic = cell.querySelector('picture');
      if (pic) {
        const holder = document.createElement('div');
        holder.className = 'carousel-hotspot-slide-image';
        holder.append(pic);
        slide.prepend(holder);
      }
    }
    if (!cell.textContent.trim()) {
      cell.remove();
      return;
    }
    cell.className = 'carousel-hotspot-hotspots';
    const groups = groupHotspots(cell);
    const hotspots = groups.map((group, i) => buildHotspot(
      block,
      group,
      i,
      `${block.id}-slide-${slideIndex}-hotspot-${i}`,
    ));
    cell.replaceChildren(...hotspots);
    slide.append(cell);
  });

  return slide;
}

export default function decorate(block) {
  blockCount += 1;
  block.id = block.id || `carousel-hotspot-${blockCount}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const track = document.createElement('ul');
  track.className = 'carousel-hotspot-slides';

  [...block.children].forEach((row, idx) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) {
      row.remove();
      return;
    }
    const slide = createSlide(block, row, idx);
    slide.setAttribute('aria-roledescription', 'Slide');
    track.append(slide);
    row.remove();
  });

  optimizePictures(track, '750');
  const slides = [...track.children];
  slides.forEach((slide, i) => slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`));

  block.replaceChildren(track);
  const { controls } = createSlider(block, track, {
    prefix: 'carousel-hotspot',
    labels: { previous: 'Previous slide', next: 'Next slide' },
  });
  block.append(controls);

  // outside click and Escape close an open popover
  document.addEventListener('click', () => closeAll(block));
  block.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = block.querySelector('.carousel-hotspot-pin[aria-expanded="true"]');
    if (open) {
      closeAll(block);
      open.focus();
    }
  });
}
