import {
  createModal,
  createSlider,
  findVideo,
  isVideoFile,
  isSafeUrl,
  moveInstrumentation,
  optimizePictures,
  removeWithEmptyParent,
} from '../../scripts/block-utils.js';

/** YouTube/Vimeo page URLs become autoplaying embed URLs; anything else is used as-is. */
function toEmbedUrl(src) {
  const url = new URL(src, window.location.href);
  if (url.hostname.includes('youtu.be')) {
    return `https://www.youtube.com/embed/${url.pathname.split('/')[1]}?autoplay=1&rel=0`;
  }
  if (url.hostname.includes('youtube.com')) {
    const id = url.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0` : url.href;
  }
  if (url.hostname.includes('vimeo.com') && !url.hostname.startsWith('player.')) {
    return `https://player.vimeo.com/video/${url.pathname.split('/').filter(Boolean).pop()}?autoplay=1`;
  }
  return url.href;
}

function renderPlayer(body, src, title) {
  body.textContent = '';
  if (isVideoFile(src)) {
    const video = document.createElement('video');
    video.className = 'carousel-video-modal-video';
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.src = src;
    if (title) video.setAttribute('aria-label', title);
    body.append(video);
    video.play().catch(() => {});
  } else {
    const iframe = document.createElement('iframe');
    iframe.className = 'carousel-video-modal-iframe';
    iframe.src = toEmbedUrl(src);
    iframe.title = title || 'Video';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    body.append(iframe);
  }
}

function createSlide(row, modal) {
  const slide = document.createElement('li');
  slide.className = 'carousel-video-slide';
  moveInstrumentation(row, slide);

  const video = findVideo(row, { allowHosts: true })
    // fall back to any link when the URL does not look like a known video
    || (() => {
      const link = row.querySelector('a[href]');
      return link && isSafeUrl(link.href) ? { src: link.href, element: link } : null;
    })();
  if (video) {
    // a video link with real text (e.g. the title) keeps its text; a bare URL is dropped
    const el = video.element;
    const text = el.textContent.trim();
    if (el.tagName === 'A' && text && !/^https?:\/\//i.test(text)) el.replaceWith(...el.childNodes);
    else removeWithEmptyParent(el);
  }

  const cells = [...row.children];
  const imageCell = cells.find((cell) => cell.querySelector('picture'));
  if (imageCell) {
    imageCell.className = 'carousel-video-slide-image';
    slide.append(imageCell);
  }
  cells.filter((cell) => cell !== imageCell).forEach((cell) => {
    if (!cell.textContent.trim()) {
      cell.remove();
      return;
    }
    cell.className = 'carousel-video-slide-content';
    slide.append(cell);
  });

  const titleEl = slide.querySelector('.carousel-video-slide-content :is(h1, h2, h3, h4, h5, h6)')
    || slide.querySelector('.carousel-video-slide-content p');
  if (titleEl) titleEl.classList.add('carousel-video-title');
  const title = titleEl?.textContent.trim() || slide.querySelector('img')?.alt || '';

  if (video) {
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'carousel-video-play';
    play.setAttribute('aria-haspopup', 'dialog');
    play.setAttribute('aria-label', title ? `Play video: ${title}` : 'Play video');
    play.addEventListener('click', () => {
      renderPlayer(modal.body, video.src, title);
      modal.open(play);
    });
    slide.append(play);
  } else {
    slide.classList.add('carousel-video-slide-no-video');
  }
  return slide;
}

export default function decorate(block) {
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const modal = createModal('carousel-video-modal', {
    closeLabel: 'Close video',
    onClose: (body) => {
      // stop playback and release the media when the overlay closes
      body.querySelectorAll('video').forEach((v) => v.pause());
      body.textContent = '';
    },
  });

  const track = document.createElement('ul');
  track.className = 'carousel-video-slides';
  [...block.children].forEach((row) => {
    if (row.textContent.trim() || row.querySelector('picture, a')) {
      track.append(createSlide(row, modal));
    }
    row.remove();
  });

  optimizePictures(track, '500');
  const slides = [...track.children];
  slides.forEach((slide, i) => {
    slide.setAttribute('aria-roledescription', 'Slide');
    slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
  });

  block.replaceChildren(track);
  const { controls } = createSlider(block, track, {
    prefix: 'carousel-video',
    labels: { previous: 'Previous slide', next: 'Next slide' },
  });
  block.append(controls, modal.dialog);
}
