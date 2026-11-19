# Contributing to Barcode Label Studio

Thank you for helping improve Barcode Label Studio!

## How to Contribute

- **Bug reports**: use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).
- **Feature requests**: use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).
- **Pull requests**: code, docs, and new symbologies are all welcome.

## Development Principles

1. **Zero build step**: `index.html` must remain directly runnable from `file://` or any static server without Node/npm bundling.
2. **Standards-accurate encoders**: follow the official start/stop patterns, quiet-zone minimums, and check-digit rules for every symbology.
3. **Print accuracy**: sticker-sheet layouts must use physical millimeter (`mm`) `@page` and grid dimensions so printed sheets align with die-cut stock at 100% scale.

## Pull Request Checklist

- [ ] Every new top-level `function` in `index.html` is exported on `globalThis.__BARCODE_API__` and tested via `api.<fnName>` in `tests/barcode.test.js`.
- [ ] Every new `data-i18n` / `data-i18n-placeholder` key has matching non-empty entries in `I18N.en` and `I18N.he`.
- [ ] New or changed SVG assets in `assets/` include `<title>` and `<desc>` and are well-formed.
- [ ] New docs or changed user-facing behavior is reflected in `README.md` and `CHANGELOG.md`.
- [ ] `npm test` passes locally.
- [ ] Verified in a modern browser on desktop, tablet, and mobile viewports in both light and dark themes.

All PRs run through the automated gate in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
