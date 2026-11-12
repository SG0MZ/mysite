import {
  createSlider,
  moveInstrumentation,
  optimizePictures,
} from '../../scripts/block-utils.js';

/** A paragraph holding only links (and whitespace/separators) is a tag list. */
function isLinkList(el) {
  if (el.tagName !== 'P' && el.tagName !== 'UL') return false;
  const links = el.querySelectorAll('a');
  if (!links.length) return false;
  const linkText = [...links].map((a) => a.textContent).join('');
  return el.textContent.replace(/[\s,|•·]/g, '').length === linkText.replace(/\s/g, '').length;
}

function decorateBody(body) {
  const title = body.querySelector('h1, h2, h3, h4, h5, h6')
    || [...body.children].find((el) => el.tagName === 'P' && el.querySelector('a'))
    || body.querySelector('p');
  if (!title) return;
  title.classList.add('cards-blog-slider-title');
  const titleLink = title.querySelector('a');
  if (titleLink) titleLink.classList.add('cards-blog-slider-title-link');

  // links after the title that stand alone are category tags
  let el = title.nextElementSibling;
  while (el) {
    if (isLinkList(el)) {
      el.classList.add('cards-blog-slider-tags');
      el.classList.remove('button-wrapper');
      el.querySelectorAll('a').forEach((a) => {
        a.classList.remove('button', 'primary', 'secondary', 'accent');
        a.classList.add('cards-blog-slider-tag');
      });
    }
    el = el.nextElementSibling;
  }
}

/** Article cards (image, title link, category tags) in a horizontal slider. */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-blog-slider-track';
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) {
      row.remove();
      return;
    }
    const li = document.createElement('li');
    li.className = 'cards-blog-slider-card';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-blog-slider-card-image';
      } else if (div.textContent.trim() || div.querySelector('picture')) {
        div.className = 'cards-blog-slider-card-body';
        decorateBody(div);
      } else {
        div.remove();
      }
    });
    ul.append(li);
  });
  optimizePictures(ul, '500');

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');
  block.replaceChildren(ul);
  const { controls } = createSlider(block, ul, {
    prefix: 'cards-blog-slider',
    labels: { previous: 'Previous articles', next: 'Next articles' },
  });
  block.append(controls);
}
