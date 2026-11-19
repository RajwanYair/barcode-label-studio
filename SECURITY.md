# Security Policy

## Architecture & Data Privacy

This application runs entirely in the user's browser:

- No barcode values, imported files, or generated images are sent to any server.
- All SVG, PNG, and print/PDF generation happens locally in browser memory.

## Supported Versions

| Version | Supported |
| :--- | :---: |
| 1.x | ✅ |

## Reporting a Vulnerability

If you discover a security issue (for example, DOM XSS through label rendering or file-parsing vulnerabilities):

1. Do **not** open a public issue with exploit details.
2. Use GitHub's **Report a vulnerability** button under the repository **Security** tab (Private Vulnerability Reporting).
3. Include steps to reproduce and a minimal sample input or file.
