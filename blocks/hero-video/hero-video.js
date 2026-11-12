import {
  findVideo,
  removeWithEmptyParent,
  createBackgroundVideo,
  createVideoToggle,
  playVideo,
  prefersReducedMotion,
} from '../../scripts/block-utils.js';

/**
 * Hero with an autoplaying, muted, looping background video over a poster image.
 * Authored content: a poster picture and a link to the video file (any cell), then the
 * text (heading, subheading, CTA). Missing video: the block renders as an image hero.
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const video = findVideo(block);

  const media = document.createElement('div');
  media.className = 'hero-video-media';
  const content = document.createElement('div');
  content.className = 'hero-video-content';

  if (picture) {
    const pictureParent = picture.parentElement;
    media.append(picture);
    if (pictureParent && pictureParent.tagName === 'P' && !pictureParent.textContent.trim()) {
      pictureParent.remove();
    }
  }
  if (video) removeWithEmptyParent(video.element);

  // keep each non-empty cell (and its UE instrumentation) as part of the text content
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    if (cell.textContent.trim() || cell.querySelector('img, picture')) {
      cell.classList.add('hero-video-text');
      content.append(cell);
    }
  });

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture, img')) row.remove();
  });
  block.replaceChildren(media, content);

  if (!video) return;
  block.classList.add('hero-video-has-video');

  const poster = picture?.querySelector('img');
  const videoEl = createBackgroundVideo(video.src, poster?.currentSrc || poster?.src);
  videoEl.className = 'hero-video-video';
  videoEl.addEventListener('playing', () => block.classList.add('hero-video-is-playing'), { once: true });
  media.append(videoEl);

  const toggle = createVideoToggle(videoEl, 'hero-video-toggle', {
    pause: 'Pause background video',
    play: 'Play background video',
  });
  block.append(toggle.button);

  if (prefersReducedMotion()) return;

  // start once the hero is on screen; pause while it is scrolled away
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!toggle.isUserPaused()) playVideo(videoEl);
      } else if (!videoEl.paused) {
        videoEl.pause();
      }
    });
  }, { threshold: 0.1 });
  observer.observe(block);
}
