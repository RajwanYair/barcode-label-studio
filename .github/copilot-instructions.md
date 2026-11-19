---
name: barcode-label-studio-instructions
description: "Workspace architecture, 100% __BARCODE_API__ Meta-Guard test gate, bilingual EN/HE parity, and print geometry invariants for Barcode Label Studio."
---

# Barcode Label Studio — GitHub Copilot Workspace Instructions

## Architecture & Core Invariants

1. **Zero-Backend Single-File App (`index.html`)**:
   - The production application lives entirely in [index.html](../index.html) with inline CSS and JavaScript.
   - Do not introduce build steps, bundlers, or required npm runtime dependencies.
   - Any optional third-party browser helper (such as SheetJS `xlsx.full.min.js`) must load asynchronously (`async defer`) and degrade gracefully when offline.

2. **100% Meta-Guard Export & Test Gate (`tests/barcode.test.js`)**:
   - Every top-level `function` (4-space indented `function name(...)`) inside the inline `<script>` of [index.html](../index.html) **must** be:
     1. Exported on `globalThis.__BARCODE_API__` at the bottom of [index.html](../index.html).
     2. Directly invoked via `api.<fnName>` in [tests/barcode.test.js](../tests/barcode.test.js).
   - Every new lookup table or constant must also be exported on `globalThis.__BARCODE_API__` and verified in [tests/barcode.test.js](../tests/barcode.test.js).
   - Every DOM element ID queried via `document.getElementById(...)` during initialization must exist in the HTML markup of [index.html](../index.html).

3. **Bilingual I18N Parity (`en` LTR + `he` RTL)**:
   - Every `data-i18n` and `data-i18n-placeholder` attribute in [index.html](../index.html) must have a non-empty translation in both `I18N.en` and `I18N.he`.
   - Barcode payloads, serial numbers, and code metrics must retain `.ltr-code` (`direction: ltr; unicode-bidi: isolate`) so RTL mode never reverses serial strings.

4. **Scanner-Safe Contrast & Physical Print Geometry**:
   - Sticker cells (`.thermal-sticker`, `.sticker-cell`) must remain pure white (`#ffffff`) with dark bars (`#11161c`) regardless of whether the workbench UI is in Light or Dark mode.
   - Print presets in `STICKER_LAYOUTS` must use physical millimeter (`mm`) dimensions and `@page` rules for 100% scale printing on A4 and US Letter die-cut sheets.

5. **SVG Assets, Documentation & Open-Source Gate**:
   - All SVG diagrams in `assets/` must start with `<svg xmlns="http://www.w3.org/2000/svg"`, define `viewBox="0 0 W H"`, include `<title>` and `<desc>` elements, and end with `</svg>`.
   - All local links in [README.md](../README.md), [SPEC.md](../SPEC.md), [ROADMAP.md](../ROADMAP.md), and [CONTRIBUTING.md](../CONTRIBUTING.md) must resolve to existing files in the repository.
   - Maintain a 100% free MIT open-source posture: never introduce commercial, payment, subscription, or quote terminology in code or docs.

## Verification Command

Always run the automated test suite after any code, asset, config, or documentation change:

```bash
npm test
```
