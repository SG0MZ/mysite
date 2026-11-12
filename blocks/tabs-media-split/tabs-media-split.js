import {
  createBackgroundVideo,
  createVideoToggle,
  findVideo,
  playVideo,
  prefersReducedMotion,
  removeWithEmptyParent,
  stripInstrumentation,
} from '../../scripts/block-utils.js';

let blockCount = 0;

/** Move the panel's video link (as an autoplay video) or its picture into a media column. */
function buildMedia(textCol) {
  const media = document.createElement('div');
  media.className = 'tabs-media-split-media';
  const video = findVideo(textCol);
  const picture = textCol.querySelector('picture');
  let player = null;

  if (video) {
    removeWithEmptyParent(video.element);
    const poster = picture?.querySelector('img');
    const videoEl = createBackgroundVideo(video.src, poster?.currentSrc || poster?.src);
    videoEl.className = 'tabs-media-split-video';
    const toggle = createVideoToggle(videoEl, 'tabs-media-split-toggle');
    media.append(videoEl, toggle.button);
    player = { video: videoEl, isUserPaused: toggle.isUserPaused };
  }
  if (picture) {
    const parent = picture.parentElement;
    // with a video the picture is only its poster
    if (video) picture.remove();
    else media.append(picture);
    if (parent && parent.tagName === 'P' && !parent.textContent.trim()) parent.remove();
  }
  return { media: media.children.length ? media : null, player };
}

export default function decorate(block) {
  blockCount += 1;
  const tablist = document.createElement('div');
  tablist.className = 'tabs-media-split-list';
  tablist.setAttribute('role', 'tablist');

  const tabs = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!row.textContent.trim() && !row.querySelector('picture, a')) {
      row.remove();
      return;
    }
    const index = tabs.length;
    const id = `tabs-media-split-${blockCount}-panel-${index + 1}`;

    // one cell: it is content and the label comes from its first heading
    const labelCell = cells.length > 1 ? cells[0] : null;
    const contentCells = cells.length > 1 ? cells.slice(1) : cells;
    let labelHTML = labelCell?.innerHTML.trim();
    if (!labelHTML) {
      const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
      labelHTML = heading ? heading.textContent.trim() : `Tab ${index + 1}`;
    }

    const panel = row;
    panel.className = 'tabs-media-split-panel';
    panel.id = id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${id}`);

    const textCol = document.createElement('div');
    textCol.className = 'tabs-media-split-text';
    contentCells.forEach((cell) => {
      if (cell.textContent.trim() || cell.querySelector('picture, a')) {
        cell.classList.add('tabs-media-split-content');
        textCol.append(cell);
      } else {
        cell.remove();
      }
    });
    const { media, player } = buildMedia(textCol);
    if (labelCell) labelCell.remove();
    panel.replaceChildren(textCol);
    if (media) {
      panel.append(media);
      panel.classList.add('tabs-media-split-panel-has-media');
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-media-split-tab';
    button.id = `tab-${id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', id);
    button.innerHTML = labelHTML;
    stripInstrumentation(button);
    // a label authored as a paragraph/heading renders inline in the button
    if (button.children.length === 1 && button.firstElementChild.matches('p, h1, h2, h3, h4, h5, h6')) {
      button.innerHTML = button.firstElementChild.innerHTML;
    }
    tablist.append(button);
    tabs.push({ button, panel, player });
  });

  if (!tabs.length) return;

  let inView = false;
  let active = 0;

  const syncVideos = () => {
    tabs.forEach(({ player }, i) => {
      if (!player) return;
      if (i === active && inView && !prefersReducedMotion() && !player.isUserPaused()) {
        playVideo(player.video);
      } else if (!player.video.paused) {
        player.video.pause();
      }
    });
  };

  const select = (index, focus = false) => {
    active = index;
    tabs.forEach(({ button, panel }, i) => {
      const selected = i === index;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      panel.hidden = !selected;
      panel.setAttribute('aria-hidden', String(!selected));
    });
    if (focus) tabs[index].button.focus();
    syncVideos();
  };

  tabs.forEach(({ button }, i) => {
    button.addEventListener('click', () => select(i));
  });
  tablist.addEventListener('keydown', (e) => {
    const keys = {
      ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: tabs.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    select((keys[e.key] + tabs.length) % tabs.length, true);
  });

  block.prepend(tablist);
  select(0);

  // UE: selecting a panel in the editor tree shows its tab
  block.addEventListener('aue:ui-select', (e) => {
    const index = tabs.findIndex(({ panel }) => panel.contains(e.target));
    if (index >= 0) select(index);
  });

  // only the visible tab's video plays, and only while the block is on screen
  const observer = new IntersectionObserver((entries) => {
    inView = entries.some((entry) => entry.isIntersecting);
    syncVideos();
  }, { threshold: 0.25 });
  observer.observe(block);
}
