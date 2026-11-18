# Barcode Label Studio — Single &amp; Batch Sticker Sheet Studio

A zero-backend, browser-native 1D &amp; 2D QR barcode generator with custom brand logo embedding and batch sticker sheet printing studio. Runs entirely client-side from a single [index.html](index.html) file—ready for local offline use or static hosting via GitHub Pages.

## Features

### 1. Single Barcode Workbench
- **Universal Input**: Encode numeric serials, retail codes, URLs, or full ASCII text strings.
- **Live Symbology Engine**:
  - **Code 128 Auto**: Automatically compacts even digit runs using high-density **Code 128C** and switches to **Code 128B** for ASCII text, with Modulo 103 check character calculation.
  - **Code 39**: Industrial alphanumeric standard (`0–9`, `A–Z`, space, and `- . $ / + %`) with Modulo 43 telemetry.
  - **EAN-13**: Retail 12/13-digit barcode with automatic check-digit calculation and validation/repair.
  - **ITF (Interleaved 2 of 5)**: High-density even-length numeric encoding (auto zero-pads odd-length numbers).
  - **QR Code (ISO/IEC 18004 Model 2)**: Automatic version selection (Versions 1–6) with Reed-Solomon error correction and optimal mask evaluation.
- **Custom Brand Logo Embedding**: Upload any image (PNG/SVG/JPG/WebP) to embed above 1D barcode bars or centered inside QR Codes across both Single and Batch modes.
- **Precision Controls**: Adjustable bar width (1–4 px), bar height (40–160 px), quiet-zone margin, and human-readable label font size.
- **Exports**: High-DPI PNG (2x retina), crisp vector SVG, direct clipboard image copy, and single-label printing.

### 2. Batch & Standard Sticker Sheet Printing
- **Three Input Sources**:
  - **Text List**: Paste or type one barcode value per line.
  - **Number Range Generator**: Generate sequential ranges (`1000` to `1050`) including prefix and zero-padding preservation (e.g., `SN-00100` to `SN-00150`).
  - **File Import**: Drag-and-drop or browse for `.txt`, `.csv`, `.tsv`, or Excel (`.xlsx` / `.xls`) files.
- **Global Standard Sticker Sheet Layouts**:
  - **A4 — 3 × 8 (24 labels/sheet)**: `63.5 × 33.9 mm` (Avery L7159 / J8159 standard)
  - **A4 — 2 × 7 (14 labels/sheet)**: `99.1 × 33.9 mm` (Avery L7163 / J8163 standard)
  - **A4 — 4 × 10 (40 labels/sheet)**: `48.5 × 16.9 mm`
  - **US Letter — 3 × 10 (30 labels/sheet)**: `66.0 × 25.4 mm` (`2.625" × 1"`, Avery 5160 / 8160 standard)
  - **US Letter — 2 × 7 (14 labels/sheet)**: `101.6 × 33.9 mm` (`4" × 1.33"`, Avery 5162 standard)
  - **Flow Mode**: Full-width continuous rows
- **Batch Exports**:
  - **Print to Printer**: Native print stylesheet strips UI chrome and formats labels to page boundaries.
  - **PDF (Print-Ready)**: Opens a print-sized document configured with `@page` dimensions for one-click **Save as PDF**.
  - **PNG & SVG Batch Downloads**: Export all generated barcodes as vector SVG or raster PNG images.

## Quick Start

### Run Locally
No build step or server is required. Open [index.html](index.html) directly in any modern browser:

```bash
# Linux
xdg-open index.html

# macOS
open index.html
```

Or serve over local HTTP:

```bash
python3 -m http.server 8080
```

### Run Unit Tests
A zero-dependency unit test suite (using Node's built-in `node:test` runner and `node:vm`) validates all 4 barcode encoders, GS1/Mod-103/Mod-43 check digits, SVG rendering/XML escaping, range parsing, sticker sheet layouts, and DOM/file integrity:

```bash
npm test
# or directly:
node --test tests/barcode.test.js
```

### Deploy on GitHub Pages
1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/ (root)`, and click **Save**.

## Project Structure

```text
.
├── index.html                           # Self-contained application (HTML + CSS + JS)
├── README.md                            # Project overview and usage guide
├── LICENSE                              # MIT License
├── CONTRIBUTING.md                      # Contribution guidelines
├── CODE_OF_CONDUCT.md                   # Contributor Covenant Code of Conduct
├── SECURITY.md                          # Security policy and reporting
├── CHANGELOG.md                         # Release history
└── .github/
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── PULL_REQUEST_TEMPLATE.md
```

## License

Released under the [MIT License](LICENSE).
