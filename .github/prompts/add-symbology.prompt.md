---
description: "Implement and verify a new 1D or 2D barcode symbology encoder in index.html with full Meta-Guard, I18N, SPEC.md, and test coverage."
---

# Add or Enhance a Barcode Symbology

Follow these steps when adding or updating a barcode encoder in [index.html](../../index.html):

1. **Specification Check**:
   - Review the symbology section in [SPEC.md](../../SPEC.md) and task acceptance criteria in [ROADMAP.md](../../ROADMAP.md).
   - Document character domain, start/stop guard patterns, check-digit formula, and module width/matrix geometry.

2. **Encoder Implementation (`index.html`)**:
   - Implement the pure encoder function(s) and lookup tables in [index.html](../../index.html).
   - Return `{ bits, displayText, modeLabel, checksumLabel }` for 1D symbologies or `{ qrModules, qrSize, displayText, modeLabel, checksumLabel }` for 2D matrix symbologies.
   - On invalid input, return `{ error, fixValue?, canSwitchTo128? }` with actionable user feedback.
   - Wire the symbology into `encodeCurrent(value, sym)` and `buildBarcodeSvgHtml(...)`.

3. **UI & Bilingual I18N (`en` + `he`)**:
   - Add `<option>` entries to `#symbologySelect` and `#batchSymbology` with `data-i18n` attributes.
   - Add matching English and Hebrew strings to `I18N.en` and `I18N.he`.

4. **Meta-Guard Export & Automated Tests (`tests/barcode.test.js`)**:
   - Export all new top-level functions and lookup tables on `globalThis.__BARCODE_API__`.
   - Add unit tests in [tests/barcode.test.js](../../tests/barcode.test.js) calling `api.<fnName>` directly for valid inputs, check-digit repair, and error cases.
   - Run `npm test` and confirm 100% pass.
