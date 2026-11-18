# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-17

### Added
- **Single Barcode Workbench**:
  - Pure JavaScript SVG barcode encoders for **Code 128 Auto** (128B ASCII + 128C numeric compaction), **Code 39**, **EAN-13** (with automatic check-digit calculation/repair), **ITF (Interleaved 2 of 5)**, and **QR Code** (ISO/IEC 18004 Model 2, Versions 1–6 with Reed-Solomon ECC).
  - Custom brand logo upload & embedding (header banner above 1D barcodes and centered badge overlay on QR Codes).
  - Live geometry controls for bar width, bar height, quiet-zone margin, human-readable label toggle, and font size.
  - Export actions for 2x retina PNG, vector SVG, clipboard image copy, and print-ready single label.
- **Batch / Sticker Sheet Print Studio**:
  - Multi-line text input, inclusive numeric/prefixed range generator (`SN-100` to `SN-110`), and file import (`.txt`, `.csv`, `.tsv`, `.xlsx`, `.xls`).
  - Global standard sticker sheet presets for A4 (`3×8`, `2×7`, `4×10`), US Letter (`3×10`, `2×7`), and continuous flow.
  - Batch export to Printer, print-ready PDF (`@page` sized), combined SVG, and PNG downloads.
