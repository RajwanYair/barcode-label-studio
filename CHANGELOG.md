# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-17

### Added

- **Single-barcode workbench** for Code 128 Auto, Code 39, EAN-13, ITF, and QR Code (ISO/IEC 18004 v1–v6).
- **Batch sticker-sheet studio** with multi-line input, numeric/prefixed range generator, and CSV/TSV/Excel import.
- **Avery/ISO print presets**: `a4-3x8`, `a4-2x7`, `a4-4x10`, `letter-3x10`, `letter-2x7`, and `flow`.
- **Custom logo and text** embedding (header banner for 1D, centered badge for QR).
- **Bilingual UI** in English (LTR) and Hebrew (RTL), with serial values kept LTR.
- **Light and dark themes** with `prefers-color-scheme` detection, `localStorage` persistence, and scanner-safe white sticker surfaces.
- **Responsive layouts** for desktop, tablet, and mobile viewports.
- **35-test automated suite** (meta-guard, encoders, I18N parity, SVG/docs integrity) run in GitHub Actions.
- **CI/CD** on Node 20/22 with shallow checkout, concurrency cancellation, and GitHub Pages deployment.
- **MIT license** and full public documentation (`README.md`, `SPEC.md`, `ROADMAP.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`).
