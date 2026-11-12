# tabs-media-split

Custom **tabs** block. Purpose: Tabbed feature showcase: each tab shows text (heading, paragraph, link) beside an autoplaying muted video or an image.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per tab: label | heading, paragraph, link, video link or picture.

## Supported variations

No variations.

## Universal Editor fields

- Content fields derived from the block's decorate contract.

## Behavior

Centered tab labels with a green underline on the active tab; clicking switches the panel; panel splits text (H2, paragraph, arrow link) left and an autoplay muted looping video in a dark rounded frame right, with a pause toggle.

## Authoring notes

One row per tab: tab label | content with heading, text, optional link and a link to an .mp4 video (or a picture). Only the active tab's video plays, and only while on screen.
