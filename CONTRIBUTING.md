# Contributing to Barcode Label Studio

Thank you for your interest in improving Barcode Label Studio!

## Ways to Contribute

- **Bug Reports**: Found an encoding edge case or print layout alignment issue? Open an issue using the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).
- **Feature Requests**: Want a new barcode symbology (e.g., UPC-A, Codabar, QR Code) or a new Avery/ISO label sheet preset? Open an issue using the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).
- **Pull Requests**: Direct code and documentation improvements are welcome.

## Development Principles

1. **Zero Build Step**: The application lives in [index.html](index.html) and must remain directly runnable from a `file://` URL or static file server without requiring Node/npm bundling.
2. **Standards-Accurate Symbologies**: Every barcode encoder must follow the official start/stop patterns, quiet-zone minimums, and check-digit calculations for its specification.
3. **Print Accuracy**: Sticker sheet layouts must use physical millimeter (`mm`) `@page` and grid dimensions so printed pages align with physical die-cut label stock at 100% print scale.

## Pull Request Checklist & Automated Test Gate

Every pull request is automatically verified by [`tests/barcode.test.js`](tests/barcode.test.js) via GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)):

- [ ] **100% Function Coverage Gate**: Every top-level `function` in [`index.html`](index.html) must be exported on `globalThis.__BARCODE_API__` and explicitly tested via `api.<fnName>` in [`tests/barcode.test.js`](tests/barcode.test.js).
- [ ] **100% Bilingual I18N Gate**: Every `data-i18n` and `data-i18n-placeholder` attribute in [`index.html`](index.html) must have matching non-empty translations in both `I18N.en` (English) and `I18N.he` (Hebrew).
- [ ] **Config, SVG & Documentation Gate**: All local Markdown links, Mermaid diagrams, SVG assets in `assets/`, and [`package.json`](package.json) / workflow configs must pass `npm test`.
- [ ] Tested in a modern browser via `file://` and local HTTP server across Desktop, Tablet, and Mobile viewports in both Light and Dark themes.
- [ ] Updated [CHANGELOG.md](CHANGELOG.md) and [README.md](README.md) if user-facing features changed.
