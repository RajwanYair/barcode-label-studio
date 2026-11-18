<div align="center">

# 🗺️ Barcode Label Studio — Open-Source Engineering Roadmap (`ROADMAP.md`)

<img src="assets/roadmap-sprints.svg" alt="Barcode Label Studio 6-Sprint Engineering Roadmap" width="100%" />

<br />

[![Current Release](https://img.shields.io/badge/Current_Release-v1.0.0_(Sprint_1_Complete)-059669?style=for-the-badge)](CHANGELOG.md)
[![Specification](https://img.shields.io/badge/Technical_Spec-SPEC.md-2563eb?style=for-the-badge)](SPEC.md)
[![Test Gate](https://img.shields.io/badge/Automated_Gate-100%25_Function_%26_Doc_Tests-7c3aed?style=for-the-badge)](tests/barcode.test.js)

</div>

---

## 🎯 Roadmap Overview & Sprint Timeline

This roadmap translates the technical specification in **[`SPEC.md`](SPEC.md)** into self-contained, testable **engineering sprints** for continuous open-source development. Every sprint task is paired with an automated test requirement in [`tests/barcode.test.js`](tests/barcode.test.js).

```mermaid
gantt
    title 🚀 Barcode Label Studio — Multi-Sprint Development Roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %b %Y

    section ✅ Sprint 1 (v1.0)
    Core 1D & QR Engine + Batch Sheets       :done,    s1a, 2026-11-01, 2026-11-17
    Responsive UI + Dark/Light + EN/HE I18N  :done,    s1b, 2026-11-17, 2026-11-18
    100% Function & Doc Meta-Guard Tests     :done,    s1c, 2026-11-18, 2026-11-19

    section 🏷️ Sprint 2 (v1.1)
    UPC-A, EAN-8 & Codabar 1D Encoders       :active,  s2a, 2026-11-20, 2026-12-05
    QR Versions 7–15 & Configurable ECC      :         s2b, 2026-12-05, 2026-12-18
    DataMatrix (ECC 200) 2D Encoder          :         s2c, 2026-12-18, 2027-01-05

    section 📐 Sprint 3 (v1.2)
    Custom Sheet Geometry Builder (mm/in)    :         s3a, 2027-01-06, 2027-01-20
    Multi-Column CSV Template Binding        :         s3b, 2027-01-20, 2027-02-05
    Start-Row / Skip-Used-Stickers Offset    :         s3c, 2027-02-05, 2027-02-18

    section 📷 Sprint 4 (v1.3)
    WebRTC Camera Barcode Verifier           :         s4a, 2027-02-19, 2027-03-08
    Contrast & Quiet-Zone ISO Grading        :         s4b, 2027-03-08, 2027-03-22

    section 💾 Sprint 5 (v1.4)
    PWA Service Worker & Offline Install     :         s5a, 2027-03-23, 2027-04-08
    IndexedDB Saved Label Templates          :         s5b, 2027-04-08, 2027-04-22

    section 🖨️ Sprint 6 (v2.0)
    ZPL II & ESC/POS Thermal Printer Export  :         s6a, 2027-04-23, 2027-05-15
    WebUSB / WebSerial Direct Label Print    :         s6b, 2027-05-15, 2027-06-01
```

---

## 🔗 Sprint Dependency Flow

```mermaid
flowchart LR
    S1["✅ Sprint 1 (v1.0)<br/>Core 1D/QR + Avery Sheets<br/>EN/HE + Dark/Light + Tests"] --> S2["🏷️ Sprint 2 (v1.1)<br/>UPC-A • EAN-8 • Codabar<br/>DataMatrix • QR ECC L/M/Q/H"]
    S1 --> S3["📐 Sprint 3 (v1.2)<br/>Custom Sheet Builder<br/>Skip Used Stickers • CSV Fields"]
    S2 --> S4["📷 Sprint 4 (v1.3)<br/>Camera Scan Verifier<br/>Quiet-Zone & Contrast Grader"]
    S3 --> S5["💾 Sprint 5 (v1.4)<br/>PWA Offline Worker<br/>IndexedDB Template Library"]
    S4 & S5 --> S6["🖨️ Sprint 6 (v2.0)<br/>ZPL II / ESC-POS Export<br/>WebUSB Thermal Printing"]
```

---

## 📋 Detailed Sprint Backlogs & Actionable Tasks

### ✅ Sprint 1 — Foundation, Multi-Device UI, Bilingual I18N & 100% Test Gate (`v1.0.0` — Completed)

| Task ID | Component | Task Description | Verification / Test Gate | Status |
| :--- | :--- | :--- | :--- | :---: |
| `S1-T1` | 📊 **1D Encoders** | Implement `encodeCode128` (`128B`/`128C` auto-compaction), `encodeCode39`, `encodeEan13`, and `encodeItf`. | Unit tests for bit patterns, check digits, and invalid input fallbacks. | ✅ Done |
| `S1-T2` | 📱 **2D QR Engine** | Implement ISO/IEC 18004 `encodeQR` (Versions 1–6) with $\text{GF}(2^8)$ Reed-Solomon ECC and finder/alignment placement. | Unit tests for `gfMul`, `rsEncode`, `qrPlaceModules`, and `encodeQR`. | ✅ Done |
| `S1-T3` | 🖼️ **Logo & Text** | Support custom company logo upload (`<image>`) and top/bottom custom sticker text across Single and Batch modes. | Unit tests for XML entity escaping, 1D banner offset, and QR center badge. | ✅ Done |
| `S1-T4` | 🖨️ **Batch Sheets** | Implement 6 physical millimeter presets (`a4-3x8`, `a4-2x7`, `a4-4x10`, `letter-3x10`, `letter-2x7`, `flow`) + CSV/Excel import. | Unit tests for `STICKER_LAYOUTS`, `parseNumericSuffix`, and `parseFileAndAdd`. | ✅ Done |
| `S1-T5` | 🌐 **Bilingual & Theme** | Add English (`LTR`) / Hebrew (`RTL`) switcher (`setLanguage`) and Light / Dark mode switcher (`setTheme`) + mobile/tablet breakpoints. | Meta-guard checks 100% `data-i18n` key parity and responsive `@media` rules. | ✅ Done |
| `S1-T6` | 🛡️ **Meta-Guard** | Enforce 100% function export & unit test coverage gate + documentation link and SVG integrity checks in `npm test`. | 32+ automated tests in [`tests/barcode.test.js`](tests/barcode.test.js) running in CI. | ✅ Done |

---

### 🏷️ Sprint 2 — Expanded Retail, Industrial & 2D Symbologies (`v1.1.0`)

| Task ID | Component | Task Description | Acceptance Criteria & Test Gate | Status |
| :--- | :--- | :--- | :--- | :---: |
| `S2-T1` | 🛒 **UPC-A & EAN-8** | Add `encodeUpcA(text)` (11/12 digits) and `encodeEan8(text)` (7/8 digits) reusing GS1 Modulo 10 check-digit logic with one-click `fixValue`. | Export on `__BARCODE_API__`; test 95-module (UPC-A) and 67-module (EAN-8) outputs. | 🗓️ Planned |
| `S2-T2` | 🏥 **Codabar** | Add `encodeCodabar(text)` supporting numeric digits, `-$:/.+`, and `A/B/C/D` start/stop characters for blood banks and libraries. | Export `encodeCodabar` & `CODABAR_MAP`; add positive/negative unit tests. | 🗓️ Planned |
| `S2-T3` | 📱 **QR ECC Levels** | Extend `encodeQR(text, ecl)` to allow user-selectable Error Correction Levels (`L = 7%`, `M = 15%`, `Q = 25%`, `H = 30%`) — auto-boosting to `H` when a center logo is attached. | Verify format information bits and ECC codeword counts for all 4 levels. | 🗓️ Planned |
| `S2-T4` | 🔲 **DataMatrix** | Implement `encodeDataMatrix(text)` (ISO/IEC 16022 ECC 200 square symbol sizes $10\times10$ to $26\times26$) for small electronics and medical vials. | Verify L-shaped finder border, alternating timing border, and Reed-Solomon ECC. | 🗓️ Planned |

---

### 📐 Sprint 3 — Custom Label Sheet Designer & Partial Sheet Printing (`v1.2.0`)

| Task ID | Component | Task Description | Acceptance Criteria & Test Gate | Status |
| :--- | :--- | :--- | :--- | :---: |
| `S3-T1` | 📏 **Custom Sheet Grid** | Add a "Custom Dimensions" preset option allowing users to input custom Page Width/Height (`mm`), Columns, Rows, Label Width/Height, and Margins. | Validate `buildCustomLayout()` bounds and persist custom presets in `localStorage`. | 🗓️ Planned |
| `S3-T2` | ⏭️ **Skip Used Cells** | Add a `startCellOffset` (`Skip first N stickers`) control so partially used Avery sticker sheets can be reused without wasting labels. | Verify `refreshBatchSheet()` inserts $N$ empty `.sticker-cell.skipped` placeholders before the first barcode. | 🗓️ Planned |
| `S3-T3` | 🗂️ **Multi-Column CSV** | Support mapping CSV/Excel columns to `{barcodeValue}`, `{titleText}`, and `{subtitleText}` per individual sticker cell (e.g., SKU + Product Name + Bin Location). | Test multi-column CSV/XLSX rows rendering distinct titles per sticker cell. | 🗓️ Planned |
| `S3-T4` | 📦 **Standalone ZIP** | Bundle batch PNG exports into a single `.zip` download using a zero-dependency store-mode ZIP builder (`buildZipBlob()`). | Verify valid PKZIP local file headers and CRC-32 checksums in unit tests. | 🗓️ Planned |

---

### 📷 Sprint 4 — Built-In Camera Barcode Scanner & Optical Verifier (`v1.3.0`)

| Task ID | Component | Task Description | Acceptance Criteria & Test Gate | Status |
| :--- | :--- | :--- | :--- | :---: |
| `S4-T1` | 📷 **Camera Scan Tab** | Add an optional verification modal using the browser's `BarcodeDetector` API (with canvas scanline fallback for 1D bars) to test-scan generated labels via webcam/phone camera. | Test mock `BarcodeDetector` decoding and fallback 1D scanline binarization. | 🗓️ Planned |
| `S4-T2` | 🔍 **Quiet-Zone Guard** | Add an automatic ISO printability check warning if `quietZone` is set below $10\times$ the narrow bar width ($X$-dimension) or if a logo obscures finder patterns. | Unit test `checkBarcodePrintability()` warning thresholds across all symbologies. | 🗓️ Planned |

---

### 💾 Sprint 5 — Progressive Web App (PWA) & Template Library (`v1.4.0`)

| Task ID | Component | Task Description | Acceptance Criteria & Test Gate | Status |
| :--- | :--- | :--- | :--- | :---: |
| `S5-T1` | 📲 **Installable PWA** | Add `manifest.webmanifest` and an optional offline cache Service Worker (`sw.js`) so users can install Barcode Label Studio as a desktop/mobile app. | Validate `manifest.webmanifest` JSON schema, icons, and `display: "standalone"`. | 🗓️ Planned |
| `S5-T2` | 🗂️ **Saved Templates** | Allow saving named batch configurations (symbology + sheet preset + custom text + logo + payload list) to `localStorage` / `IndexedDB` with JSON export/import. | Unit test `exportProjectJson()` and `importProjectJson()` round-trip fidelity. | 🗓️ Planned |

---

### 🖨️ Sprint 6 — Direct Thermal Label Printer Output (`v2.0.0`)

| Task ID | Component | Task Description | Acceptance Criteria & Test Gate | Status |
| :--- | :--- | :--- | :--- | :---: |
| `S6-T1` | 🧾 **ZPL II Generator** | Implement `exportToZpl(values, options)` generating native Zebra Programming Language (`^XA ... ^BY ... ^BC / ^BQ ... ^XZ`) for Zebra industrial roll printers. | Unit test `exportToZpl()` output commands for Code 128 (`^BC`), Code 39 (`^B3`), EAN-13 (`^BE`), and QR (`^BQ`). | 🗓️ Planned |
| `S6-T2` | 🔌 **WebSerial / WebUSB** | Add optional direct browser-to-printer dispatch over `navigator.serial` / `navigator.usb` for one-click roll label printing without OS driver dialogs. | Test command framing and mock transport stream writing. | 🗓️ Planned |
