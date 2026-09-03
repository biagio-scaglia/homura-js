# Security Policy

## Supported Versions

HomuraJS provides active security patches and updates for the following release branches:

| Version | Supported          |
| ------- | ------------------ |
| 1.4.x   | :white_check_mark: |
| 1.3.x   | :white_check_mark: |
| < 1.3   | :x:                |

---

## Reporting a Vulnerability

The HomuraJS team takes the security of our state engine, WebCrypto vault, and WordPress integrations seriously.

If you believe you have discovered a security vulnerability in HomuraJS, please **do not open a public GitHub issue**.

### How to Report:
1. Email your findings directly to the maintainer at **`biagio.scaglia.dev@gmail.com`** or open a [Private Vulnerability Advisory](https://github.com/biagio-scaglia/homura-js/security/advisories/new) on GitHub.
2. Include the following details:
   - Type of issue (e.g. Prototype Pollution, Cryptographic Nonce Re-use, XSS, Unsafe Deserialization).
   - Affected package (`@homura-js/core`, `@homura-js/vanilla`, WordPress plugin, etc.).
   - Step-by-step reproduction code or proof of concept.
   - Potential impact and recommended mitigation.

### Response Timeline:
* **Acknowledgment**: Within 24 hours.
* **Assessment & Fix**: Within 72 hours.
* **Public Release & Advisory**: Coordinated with the reporter after releasing the patched version.
