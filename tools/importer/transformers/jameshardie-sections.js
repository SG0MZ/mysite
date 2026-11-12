/* eslint-disable */
/* global WebImporter */

/**
 * James Hardie section transformer.
 *
 * Uses payload.template.sections from tools/importer/page-templates.json.
 *
 * beforeTransform (parser targets still exist): walk sections in reverse and insert
 *   an <hr> before every non-first section. Styled sections get a temporary
 *   data-excat-section-id on their <hr>; a styled first section gets a temporary
 *   marked <hr> as well.
 * afterTransform: walk sections in reverse again and add a Section Metadata block
 *   at the end of every styled section (after the surviving section element, or
 *   before the next section break following the marker), then drop marker
 *   attributes and the first section's temporary <hr>.
 */

const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    if (!sel) continue;
    let el = null;
    try {
      el = root.querySelector(sel);
    } catch (e) {
      el = null;
    }
    if (el) return el;
  }
  return null;
}

function findMarker(root, id) {
  return [...root.querySelectorAll(`hr[${MARKER}]`)].find((hr) => hr.getAttribute(MARKER) === id) || null;
}

/** Insert node at the end of the section that starts at marker (before the next <hr>). */
function insertAtSectionEnd(marker, node) {
  let cursor = marker.nextElementSibling;
  while (cursor && cursor.tagName !== 'HR') cursor = cursor.nextElementSibling;
  if (cursor) cursor.before(node);
  else marker.parentElement.append(node);
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el) continue;
      if (i === 0 && !section.style) continue;
      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      if (i === 0) hr.setAttribute('data-excat-first-section', 'true');
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const metadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      const marker = findMarker(element, section.id);
      if (marker) {
        insertAtSectionEnd(marker, metadata);
      } else {
        const el = findSectionElement(element, section);
        if (el) el.after(metadata);
      }
    }

    element.querySelectorAll('hr[data-excat-first-section]').forEach((hr) => hr.remove());
    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
  }
}
