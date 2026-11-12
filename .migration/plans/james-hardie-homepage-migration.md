# James Hardie Homepage Migration Plan

## Goal
Rebuild the James Hardie homepage (https://www.jameshardie.com/) on this Edge Delivery Services site, using the same layout and the same interactive behavior. That covers the blocks, the imported content, the header with its navigation, the footer, and design styling that matches the original.

## Your question: can you see a preview before anything is synced?
**Yes.** All the work happens in your local workspace, and you can view the result in the preview as it's built. Nothing is synced anywhere until you've looked at the preview and said so:
- No upload to Document Authoring
- No Edge Delivery preview
- No publishing
- No commit or push to the code repository

Once the page is built and styled, I'll stop and ask you to review it. You can approve it, ask for changes, or leave everything local.

## Decisions so far
- **Scope:** full page migration, meaning blocks, imported content, header/nav, footer and styling.
- **Optional Adobe Edge Delivery skills:** left off for now. The migration tools already available are enough.
- **Where changes happen:** everything stays in your local workspace and preview. Nothing is uploaded to Document Authoring, previewed on Edge Delivery, published or committed until you've reviewed the preview and explicitly asked for it.

## Approach

### 1. Analyze the page
- Capture the homepage at desktop and mobile widths, including screenshots, cleaned HTML and metadata. If the site blocks automated visits, a fallback is used to get through.
- Break the page into sections and find each block on it. A typical home-improvement homepage like this one is likely to have:
  - A hero banner or carousel with a headline and calls to action
  - Product or category cards (siding, trim, colors)
  - Promotional sections with an image and text side by side
  - Tools such as "Find a contractor" or "Order samples"
  - Inspiration or gallery content, testimonials and stats
  - A newsletter or call-to-action band
- Decide which parts should be ordinary authored text and which need a block.
- Name each block variant, reusing an existing block when it is at least 80% similar to what's needed (for example, `hero (carousel)` or `cards (product)`).

### 2. Build the blocks
- Start from the blocks already in the project (hero, cards, columns, fragment, header, footer) and add new blocks only where the page needs them.
- Recreate the interactive behavior: carousel or slider controls, tabs or accordions, and hover effects.
- Write each block to cope with authors leaving out or adding cells, keep its styles confined to that block, and leave the shared core script untouched.

### 3. Import the content
- Record which page elements map to which blocks, and how the page divides into sections.
- Create the import parsers for each block variant, plus cleanup rules for page chrome, cookie banners and scripts.
- Build the import script for the homepage, run it, and check the imported content.

### 4. Header and navigation
- Recreate the header from desktop and mobile screenshots, including the mega-menu panels that open on hover, the mobile menu, search, and utility links.

### 5. Footer
- Recreate the footer's link columns, social links, legal row, and its mobile behavior.

### 6. Design and visual check
- Pull site-wide design values from the live site (fonts, colors, spacing, buttons) and apply them.
- Style each block from the original page's measured styles.
- Compare the preview against the original, one block at a time and then the full page, and fix the differences.

### 7. Your preview review (checkpoint)
- Work stops here so you can review the finished homepage in the preview, including the header, footer and interactive parts.
- I'll include a short summary of the blocks that were built and any known differences from the original.
- You then choose one of these:
  - **Request changes:** I adjust the page and you review it again.
  - **Keep local:** the work stays in your workspace only.
  - **Sync:** upload the page to Document Authoring and/or run the Edge Delivery preview, and/or commit and open a pull request. Each of these happens only when you explicitly ask for it.

### 8. Optional sync (only after your approval)
- If you ask for an upload, the content that goes to Document Authoring is exactly what you reviewed in the preview.
- Any pull request will include the required branch preview link.
- Afterwards, I'll tell you exactly which places changed: local workspace, Document Authoring, Edge Delivery preview, live site.

## Checklist
- [ ] Capture and analyze the homepage (desktop and mobile screenshots, cleaned HTML, metadata)
- [ ] Find the sections and block variants, reusing existing blocks where they fit
- [ ] Record which page elements map to which blocks and sections
- [ ] Generate or extend the block code for every identified variant (JS + CSS, including interactive behavior)
- [ ] Generate import cleanup rules and per-block parsers
- [ ] Build the homepage import script and run the content import
- [ ] Check the imported homepage in the preview
- [ ] Migrate the header and navigation (desktop mega menu and mobile menu)
- [ ] Migrate the footer (desktop and mobile)
- [ ] Extract site-wide design values and apply global styles
- [ ] Style each block to match the original
- [ ] Compare the whole page against the original and fix the remaining differences
- [ ] **Stop for your preview review:** share the summary and wait for your decision
- [ ] Apply any changes you request and re-share the preview
- [ ] (Only if you explicitly ask) Sync to Document Authoring / Edge Delivery preview, or commit and open a pull request
- [ ] Report which places changed

## Notes and risks
- **Copyrighted material:** James Hardie's images and text belong to them. Make sure you're authorized to reuse them on this site.
- **Interactive tools:** features backed by James Hardie's own systems (contractor locator, sample ordering, color visualizer) will be rebuilt visually as blocks with their links. Their live functionality would need integrations that aren't part of this plan.
- **Bot protection:** if the site blocks automated access, analysis may take longer or need the fallback scraper.
- **Local edits get replaced:** if the import is run again later, it overwrites any small manual changes made directly to the page.

*Carrying out this plan needs Execute mode. Switch to it when you're ready and I'll start with step 1. I'll stop at step 7 so you can review the preview before anything is synced.*
