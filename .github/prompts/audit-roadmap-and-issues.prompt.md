---
description: "Audit ROADMAP.md against index.html, SPEC.md, CHANGELOG.md, and tests/barcode.test.js to keep sprint tasks and known issues accurate."
---

# Audit Roadmap, Sprints & Known Issues

Reconcile [ROADMAP.md](../../ROADMAP.md) with the codebase:

1. **Compare Implemented vs Planned Features**:
   - Check every exported function and constant on `globalThis.__BARCODE_API__` in [index.html](../../index.html) against Sprint tables `S1`–`S6` in [ROADMAP.md](../../ROADMAP.md).
   - Mark completed items (`✅ Done`), partial items (`🚧 Partial`), and planned items (`🗓️ Planned`) with exact function/DOM references.

2. **Audit Known Issues & Technical Debt**:
   - Inspect encoders, SVG/Canvas compositors, CSV/Excel file parsers, `@page` print/PDF pipelines, and CI/release workflows for gaps or edge cases.
   - Record every active issue in the Issues & Technical Debt tracker in [ROADMAP.md](../../ROADMAP.md) with severity, affected component, root cause, and target sprint/fix.

3. **Validate Links, Diagrams & Tests**:
   - Ensure Mermaid `flowchart` and `gantt` diagrams in [ROADMAP.md](../../ROADMAP.md) match current sprint statuses.
   - Run `npm test` to verify all documentation and link gates pass.
