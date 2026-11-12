import {
  createModal,
  moveInstrumentation,
  optimizePictures,
  stripInstrumentation,
} from '../../scripts/block-utils.js';

const PAGE_SIZE = 10;

function cardLabel(body, index) {
  const first = body?.querySelector('h1, h2, h3, h4, h5, h6, p, strong');
  const text = (first || body)?.textContent.trim();
  return text ? `Open post: ${text}` : `Open post ${index + 1}`;
}

/**
 * Social post grid: image tiles that reveal author/handle/date on hover or focus, open the
 * full post in an overlay on click, and show PAGE_SIZE tiles at a time behind "Load more".
 */
export default function decorate(block) {
  const modal = createModal('cards-social-grid-modal', {
    closeLabel: 'Close post',
    onClose: (body) => { body.textContent = ''; },
  });

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) {
      row.remove();
      return;
    }
    const li = document.createElement('li');
    li.className = 'cards-social-grid-card';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-social-grid-card-image';
      } else if (div.textContent.trim() || div.querySelector('picture')) {
        div.className = 'cards-social-grid-card-body';
      } else {
        div.remove();
      }
    });
    ul.append(li);
  });
  optimizePictures(ul, '500');

  const cards = [...ul.children];
  cards.forEach((li, i) => {
    const body = li.querySelector('.cards-social-grid-card-body');
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'cards-social-grid-open';
    open.setAttribute('aria-haspopup', 'dialog');
    open.setAttribute('aria-label', cardLabel(body, i));
    open.addEventListener('click', () => {
      const post = document.createElement('div');
      post.className = 'cards-social-grid-post';
      [...li.children]
        .filter((child) => child !== open)
        .forEach((child) => post.append(stripInstrumentation(child.cloneNode(true))));
      modal.body.replaceChildren(post);
      modal.open(open);
    });
    li.append(open);
  });

  block.replaceChildren(ul, modal.dialog);
  // in Universal Editor every card stays visible so all of them can be edited
  const inEditor = document.documentElement.classList.contains('adobe-ue-edit');
  if (cards.length <= PAGE_SIZE || inEditor) return;

  // reveal PAGE_SIZE more tiles per click; focus moves to the first new tile
  let shown = PAGE_SIZE;
  cards.forEach((li, i) => { li.hidden = i >= shown; });
  const more = document.createElement('div');
  more.className = 'cards-social-grid-more';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cards-social-grid-load-more';
  button.textContent = 'Load more';
  more.append(button);
  button.addEventListener('click', () => {
    const firstNew = cards[shown];
    shown = Math.min(cards.length, shown + PAGE_SIZE);
    cards.forEach((li, i) => { li.hidden = i >= shown; });
    firstNew?.querySelector('.cards-social-grid-open')?.focus();
    if (shown >= cards.length) more.remove();
  });
  ul.after(more);
}
