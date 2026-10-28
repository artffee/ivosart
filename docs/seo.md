# Search and sharing foundations

IvosArt uses 54 stable canonical pages, including 49 artwork pages, generated from the existing catalogue. `robots.txt` advertises `sitemap.xml`; the sitemap lists the canonical pages and all 49 artwork images. No crawl restriction or analytics setting was changed by the October 28, 2026 update.

## October 28 improvements

- The homepage serves six featured artwork cards and links in the initial HTML. The existing interactive gallery progressively replaces them after JavaScript starts.
- The homepage has a main landmark and a more specific title/description. Gallery and art-statement metadata identify the collection subject and artist, while the visible creative headlines are preserved.
- Both collections describe the displayed works using `CollectionPage`, ordered `ItemList` and breadcrumb data. Artwork markup continues to use `VisualArtwork`, without invented offers, reviews or availability.
- Generated catalogue pages include descriptive social-image text and real intrinsic image dimensions. Image sizing remains responsive; this reserves space before images load but is not a measured Core Web Vitals claim.
- The explicit `index.html` homepage and old `index (2).html` entrypoint redirect permanently to `/`. Existing artwork and book URLs are unchanged.

## Validation and maintenance

```sh
node scripts/build-catalogue.js
node --test tests/*.test.js
```

Commit generator, data and regenerated HTML together. Image dimensions are read without dependencies by `scripts/image-size.js` (JPEG, PNG and static WebP). Regeneration is deterministic. After deployment, verify the canonical domain's rendered pages, served metadata, sitemap and redirects. Search engines choose when to recrawl and index; these changes do not guarantee rankings. Search Console configuration and indexing requests are separate owner-authorized actions.
