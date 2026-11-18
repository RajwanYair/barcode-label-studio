# Security Policy

## Architecture & Data Privacy

This application runs **100% client-side** in the user's browser:
- No barcode values, uploaded `.txt`/`.csv`/`.xlsx` files, or generated images are ever transmitted to an external server.
- All SVG, PNG, and PDF generation happens locally in browser memory.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security issue (for example, DOM XSS in label rendering or file-parsing vulnerabilities):
1. Please **do not** open a public issue with exploit details.
2. Use GitHub's **Report a vulnerability** button under the repository's **Security** tab (Private Vulnerability Reporting), or contact the repository owner directly.
3. Include steps to reproduce and a minimal sample input or file.
