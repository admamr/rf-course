<div align="center">

# RF Global Entry Course

**A bilingual, RTL landing experience for RF Global's Entry real-estate education course.**

[![Static site](https://img.shields.io/badge/site-static_HTML-0b5?style=flat-square)](#project-structure)
[![Languages](https://img.shields.io/badge/languages-Hebrew%20%2B%20Arabic-bd8604?style=flat-square)](#languages--routes)
[![Deployment](https://img.shields.io/badge/deployment-Vercel-000?style=flat-square&logo=vercel)](#deployment)
[![RTL](https://img.shields.io/badge/layout-RTL-023d26?style=flat-square)](#languages--routes)

</div>

> [!TIP]
> The experience is designed around one clear idea: move from scattered information to a decision framework based on numbers, not guesses.

## At a glance

| 🧭 Focus | 🌍 Languages | 💳 Current flow | ⚙️ Stack |
| --- | --- | --- | --- |
| Real-estate education | Hebrew and Arabic, RTL | Landing page to external checkout | Static HTML, CSS, and vanilla JavaScript |

## Languages and routes

| Route | Source | Language |
| --- | --- | --- |
| `/` and `/entry` | `index-he.html` | Hebrew |
| `/entry-ar` | `index-ar.html` | Arabic |

Both pages share the same section structure, accessibility patterns, consent UI, tracking hooks, and course CTA contract.

## Project structure

```text
.
├── index-he.html          # Hebrew landing page
├── index-ar.html          # Arabic landing page
├── privacy.html           # Legal page
├── terms.html             # Legal page
├── refunds.html           # Legal page
├── accessibility.html     # Accessibility statement
├── assets/
│   ├── css/               # Shared design system and static Tailwind output
│   ├── js/                # UI behavior and consent-aware tracking hooks
│   ├── OGI/               # Language-specific social preview images
│   └── icons, manifest, and logo assets
├── tailwind.config.js     # Build-time utility configuration
├── tailwind.input.css     # Build-time utility entrypoint
├── vercel.json            # Static route mappings
└── .vercelignore          # Strict production allowlist
```

## Included experience

- ✨ Clear course positioning, offer, FAQs, and a direct checkout CTA
- 📊 Lightweight analysis visuals that support the data-based decision message
- 🧩 Consent UI, accessible FAQ accordion, keyboard focus states, and reduced-motion support
- 🔎 Per-language metadata, canonical URLs, hreflang, Open Graph tags, and JSON-LD schema
- 📱 Mobile-first layout with static CSS and no runtime framework

## Local preview

No package installation is required for a basic preview.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/index-he.html` or `http://localhost:8080/index-ar.html`.

## Deployment

This repository is prepared for Vercel static deployment.

1. Import the repository in Vercel.
2. Set the project root to this repository.
3. Leave the build command empty.
4. Deploy and verify `/`, `/entry`, and `/entry-ar`.

> [!IMPORTANT]
> `.vercelignore` is intentionally a strict allowlist. Only public landing pages, legal pages, assets, and deployment configuration are uploaded and served.

## Contribution guardrails

- Keep Hebrew and Arabic pages structurally aligned and fully RTL.
- Preserve legal disclosures, cookie consent, schema, checkout URLs, and CTA data attributes.
- Keep payment credentials, private documentation, strategy material, and local configuration out of Git.
- Do not add backend, authentication, or payment-provider logic without an explicitly approved implementation plan.

---

<div align="center">
Built for clear learning, careful decisions, and a focused purchase flow.
</div>
