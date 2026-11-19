# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (Unreleased)

- **Zero-dependency PKZIP archive builder (`buildZipBlob` & `CRC32_TABLE`)** in [index.html](index.html) for single-click batch PNG `.zip` downloads (`ISS-03` / `S3-T4`).
- **VS Code & GitHub Copilot Chat workspace integration**: version-controlled `.vscode/{settings,tasks,launch,extensions}.json`, [.github/copilot-instructions.md](.github/copilot-instructions.md), and `.github/prompts/*.prompt.md` (`DX-T1`, `DX-T2`).
- **GitHub Release & Dependabot automation**: [.github/workflows/release.yml](.github/workflows/release.yml) for packaging `barcode-label-studio.html`, `.zip`, and `SHA256SUMS.txt` on GitHub Actions runners (`ISS-07` / `DX-T3`), plus [.github/dependabot.yml](.github/dependabot.yml) and [.github/ISSUE_TEMPLATE/config.yml](.github/ISSUE_TEMPLATE/config.yml).

### Fixed (Unreleased)

- **QR Code BCH(15,5) format bits (`ISS-01`)**: `qrPlaceModules()` now writes both 15-bit format information copies around the three finder patterns.
- **QR Code UTF-8 byte mode (`ISS-02`)**: `qrEncodeByte()` and `encodeQR()` now encode multi-byte UTF-8 payloads (including Hebrew) via `TextEncoder` and use byte length for the mode `0100` count indicator.
- **Batch PDF skipped-sticker preservation (`ISS-04`)**: `batchDownloadPdf` now preserves `.sticker-cell.skipped` placeholders, escapes HTML, and enforces physical `mm` grid dimensions.
- **Sticker preset dimension parity (`ISS-05`)**: synchronized `STICKER_LAYOUTS` and bilingual option labels (`a4-2x7` `38.1mm`, `a4-4x10` `25.4mm`, `letter-3x10` `66.7mm`, `flow` `42.0mm`) with [README.md](README.md).
- **CSV/Excel import resilience (`ISS-06`)**: `parseFileAndAdd()` now parses RFC 4180 quoted CSV fields, skips header rows, and guards against offline `XLSX` unavailability.

## [1.0.0] - 2026-11-17

### Added (1.0.0)

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
