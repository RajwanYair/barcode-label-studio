---
description: "Check GitHub release health, CI/Pages workflow status, tag alignment, and local-vs-remote branch state."
---

# Verify GitHub Release & Workflow Status

Run a full repository and GitHub integration audit:

1. **Local Test Gate**:
   - Run `npm test` (`node --test tests/barcode.test.js`) and confirm 0 failures across all Meta-Guard, encoder, I18N, SVG, and documentation suites.

2. **Git Sync & Tag Alignment**:
   - Check `git status -sb` for untracked or uncommitted artifacts.
   - Compare `HEAD`, `origin/main`, and the latest release tag (`git show-ref --tags -d`).

3. **GitHub Actions Workflows (`ci.yml`, `release.yml`, `pages-build-deployment`)**:
   - Inspect latest workflow runs with `gh run list --repo RajwanYair/barcode-label-studio --limit 8`.
   - Verify `CI` and `pages-build-deployment` succeeded on the latest `main` commit.

4. **GitHub Release & Assets**:
   - Inspect the latest release with `gh release view --repo RajwanYair/barcode-label-studio --json tagName,name,publishedAt,targetCommitish,url,assets`.
   - Verify whether release assets (`barcode-label-studio.html`, archive, `SHA256SUMS.txt`) are attached and match the tagged commit.
