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

## Pull Request Checklist

- [ ] Tested in a modern browser via `file://` and local HTTP server.
- [ ] Verified both **Single Barcode** and **Batch / Sticker Sheet Print** tabs.
- [ ] Checked `@media print` / PDF preview with margins set to Default/100% scale.
- [ ] Updated [CHANGELOG.md](CHANGELOG.md) and [README.md](README.md) if user-facing features changed.
