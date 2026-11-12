# carousel-hotspot

Custom **carousel** block. Purpose: Horizontal slider of product lifestyle photos, each with (+) hotspots that open a product popover.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per slide: image | hotspots (heading per hotspot, optional "x, y" line, text, link).

## Supported variations

No variations.

## Universal Editor fields

- Content fields derived from the block's decorate contract.

## Behavior

Product photo slider: about 2.5-3 slides visible, bleeding off the right edge; each slide is a lifestyle image with (+) hotspot buttons that open a popover card (product name, color, View product link); prev/next circular arrows bottom-left (next is green filled), thin progress bar bottom-right; swipe/drag.

## Authoring notes

One row per slide: image in cell 1; cell 2 holds the hotspots. Each heading starts a hotspot (heading, color/description paragraph, link). An optional paragraph "x, y" (percent of image width/height, e.g. "40, 60") places the hotspot; otherwise default positions are used.
