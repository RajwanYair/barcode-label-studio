<div align="center">

# 🗺️ Barcode Label Studio — Engineering Roadmap (`ROADMAP.md`)

<img src="assets/roadmap-sprints.svg" alt="Barcode Label Studio 6-Sprint Roadmap" width="100%" />

<br />

[![Current Release](https://img.shields.io/badge/Current_Release-v1.0.0_(Sprint_1_Complete)-059669?style=for-the-badge)](CHANGELOG.md)
[![Specification](https://img.shields.io/badge/Technical_Spec-SPEC.md-2563eb?style=for-the-badge)](SPEC.md)
[![Test Gate](https://img.shields.io/badge/Automated_Gate-35_Tests-7c3aed?style=for-the-badge)](tests/barcode.test.js)

</div>

---

## 🎯 Overview

This roadmap turns the [SPEC.md](SPEC.md) into testable engineering sprints. Every sprint task has an automated test gate in [tests/barcode.test.js](tests/barcode.test.js).

```mermaid
flowchart LR
    S1["✅ Sprint 1 (v1.0)<br/>Core 1D/QR + Avery Sheets<br/>EN/HE + Dark/Light + Tests"] --> S2["🏷️ Sprint 2 (v1.1)<br/>UPC-A • EAN-8 • Codabar<br/>DataMatrix • QR ECC L/M/Q/H"]
    S1 --> S3["📐 Sprint 3 (v1.2)<br/>Custom Sheet Builder<br/>Skip Used Stickers • CSV Fields"]
    S2 --> S4["📷 Sprint 4 (v1.3)<br/>Camera Scan Verifier<br/>Quiet-Zone & Contrast Grader"]
    S3 --> S5["💾 Sprint 5 (v1.4)<br/>PWA Offline Worker<br/>IndexedDB Template Library"]
    S4 & S5 --> S6["🖨️ Sprint 6 (v2.0)<br/>ZPL II / ESC-POS Export<br/>WebUSB Thermal Printing"]
```

```mermaid
gantt
    title 🚀 Barcode Label Studio — Sprint Timeline
    dateFormat  YYYY-MM-DD
    axisFormat  %b %Y

    section ✅ Sprint 1 (v1.0)
    Core 1D & QR + Batch Sheets             :done, s1a, 2026-11-01, 2026-11-17
    Responsive UI + Dark/Light + EN/HE      :done, s1b, 2026-11-17, 2026-11-18
    35 Meta-Guard Tests                     :done, s1c, 2026-11-18, 2026-11-19

    section 🏷️ Sprint 2 (v1.1)
    UPC-A, EAN-8 & Codabar                  :active, s2a, 2026-11-20, 2026-12-05
    QR Versions 7–15 & Configurable ECC     :         s2b, 2026-12-05, 2026-12-18
    DataMatrix (ECC 200)                    :         s2c, 2026-12-18, 2027-01-05

    section 📐 Sprint 3 (v1.2)
    Custom Sheet Geometry Builder           :         s3a, 2027-01-06, 2027-01-20
    Multi-Column CSV Template Binding       :         s3b, 2027-01-20, 2027-02-05
    Start-Row / Skip-Used-Stickers Offset   :         s3c, 2027-02-05, 2027-02-18

    section 📷 Sprint 4 (v1.3)
    WebRTC Camera Barcode Verifier          :         s4a, 2027-02-19, 2027-03-08
    Contrast & Quiet-Zone ISO Grading       :         s4b, 2027-03-08, 2027-03-22

    section 💾 Sprint 5 (v1.4)
    PWA Service Worker & Offline Install    :         s5a, 2027-03-23, 2027-04-08
    IndexedDB Saved Label Templates         :         s5b, 2027-04-08, 2027-04-22

    section 🖨️ Sprint 6 (v2.0)
    ZPL II & ESC/POS Thermal Export         :         s6a, 2027-04-23, 2027-05-15
    WebSerial / WebUSB Direct Print         :         s6b, 2027-05-15, 2027-06-01
```

---

## ✅ Sprint 1 — Foundation, UI, I18N & Tests (`v1.0.0`)

| Task ID | Task | Verification | Status |
| :--- | :--- | :--- | :---: |
| S1-T1 | Implement Code 128 Auto, Code 39, EAN-13, ITF | Unit tests for bit patterns, check digits, fallbacks | ✅ Done |
| S1-T2 | Implement QR Code v1–v6 with Reed–Solomon ECC | Tests for `gfMul`, `rsEncode`, `qrPlaceModules`, `encodeQR` | ✅ Done |
| S1-T3 | Add logo upload and custom top/bottom text | XML escaping, banner offset, QR center badge | ✅ Done |
| S1-T4 | Batch sticker sheets + CSV/Excel import | `STICKER_LAYOUTS`, `parseNumericSuffix`, `parseFileAndAdd` | ✅ Done |
| S1-T5 | EN/HE switcher, Light/Dark themes, responsive breakpoints | 100% `data-i18n` parity, `@media` rules | ✅ Done |
| S1-T6 | Meta-guard test suite in CI | 35 automated tests in `tests/barcode.test.js` | ✅ Done |

---

## 🏷️ Sprint 2 — Expanded Symbologies (`v1.1.0`)

| Task ID | Task | Acceptance Criteria | Status |
| :--- | :--- | :--- | :---: |
| S2-T1 | UPC-A & EAN-8 encoders | Export on `__BARCODE_API__`; test 95/67-module outputs | 🗓️ Planned |
| S2-T2 | Codabar encoder | Export `encodeCodabar` & `CODABAR_MAP`; positive/negative tests | 🗓️ Planned |
| S2-T3 | User-selectable QR ECC levels L/M/Q/H | Verify format info bits and ECC counts for all levels | 🗓️ Planned |
| S2-T4 | DataMatrix ECC 200 (10×10 to 26×26) | Verify finder border, timing border, Reed–Solomon ECC | 🗓️ Planned |

---

## 📐 Sprint 3 — Custom Sheet Designer (`v1.2.0`)

| Task ID | Task | Acceptance Criteria | Status |
| :--- | :--- | :--- | :---: |
| S3-T1 | Custom mm/in sheet geometry builder | Validate `buildCustomLayout()` bounds; persist in `localStorage` | 🗓️ Planned |
| S3-T2 | Skip first N stickers control | `refreshBatchSheet()` inserts N skipped placeholders | 🗓️ Planned |
| S3-T3 | Multi-column CSV binding (value, title, subtitle) | Distinct titles per sticker cell | 🗓️ Planned |
| S3-T4 | Zero-dependency ZIP batch export | Valid PKZIP headers and CRC-32 tests | 🗓️ Planned |

---

## 📷 Sprint 4 — Camera Scan Verifier (`v1.3.0`)

| Task ID | Task | Acceptance Criteria | Status |
| :--- | :--- | :--- | :---: |
| S4-T1 | WebRTC camera scan tab | Mock `BarcodeDetector` and 1D scanline fallback tests | 🗓️ Planned |
| S4-T2 | Quiet-zone and contrast grader | `checkBarcodePrintability()` thresholds across symbologies | 🗓️ Planned |

---

## 💾 Sprint 5 — PWA & Template Library (`v1.4.0`)

| Task ID | Task | Acceptance Criteria | Status |
| :--- | :--- | :--- | :---: |
| S5-T1 | Installable PWA (`manifest.webmanifest`, `sw.js`) | Validate manifest schema and `display: standalone` | 🗓️ Planned |
| S5-T2 | Saved templates in `localStorage` / `IndexedDB` | Round-trip `exportProjectJson()` / `importProjectJson()` tests | 🗓️ Planned |

---

## 🖨️ Sprint 6 — Thermal Printer Output (`v2.0.0`)

| Task ID | Task | Acceptance Criteria | Status |
| :--- | :--- | :--- | :---: |
| S6-T1 | ZPL II generator (`^XA ... ^XZ`) | Test `^BC`, `^B3`, `^BE`, `^BQ` commands | 🗓️ Planned |
| S6-T2 | WebSerial / WebUSB direct print | Mock transport stream write tests | 🗓️ Planned |
