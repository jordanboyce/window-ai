# Browser AI Lab

**Browser AI Lab** is a hands-on showcase of Chrome's built-in, on-device AI — the Prompt API (`LanguageModel`), `Summarizer`, `Translator` / `LanguageDetector`, `Writer` / `Rewriter`, and `Proofreader` — plus **WebMCP** (`document.modelContext`) and a Model Context Protocol reference implementation.

This fork is ready to build and host independently. The [original project's live demo](https://windowai.danduh.me) is not a deployment of this fork.

Core built-in AI calls run **in the browser** without an application backend or API key. The optional remote MCP client, Google Fonts, and browser speech recognition can make network requests; do not treat the entire site as offline/private-by-design. This fork does not include the original site's analytics ID.

---

## What it demonstrates

- **Prompt API (`LanguageModel`)** — chat, streaming, structured output, tool calling, and multimodal (image) input
- **Summarizer** — key-points / TL;DR / headline summaries, steered with `sharedContext`
- **Translator + Language Detector** — on-device translation, plus a live voice-translation demo
- **Writer / Rewriter** — generate new text and transform existing text (tone, length, format)
- **Proofreader** — positioned, inline grammar corrections
- **WebMCP (`document.modelContext`)** — the page as a callable tool surface: a Recipe Workbench and a Generative-UI carousel
- **Cross-Border Desk** — an on-device payments copilot that reads a foreign invoice, translates it, drafts a reply, and stages/settles a payout (the `map` app)
- **MCP reference** — a stdio Model Context Protocol server + client

Each demo page ships its own API documentation with copy-and-run console snippets.

---

## Monorepo layout

This is an [Nx](https://nx.dev) monorepo.

| Workspace | What it is | Run |
|---|---|---|
| **`chat/`** | React 19 SPA — the built-in-AI demo gallery + WebMCP demos | `nx serve chat` → http://localhost:4300 |
| **`map/`** | **Cross-Border Desk** — on-device payments copilot demo | `nx serve map` → http://localhost:4200 |
| **`chrome-llm-ts/`** | TypeScript library with types for Chrome's built-in AI APIs | — |
| **`mcp/`** | Reference Model Context Protocol server (stdio) | — |
| **`mcp-client/`** | Express HTTP API + CLI wrapping an MCP client | — |
| **`devops/awsweb/`** | AWS CDK infrastructure (S3 + CloudFront + Route53) | — |
| **`notebooklm/`** | Talk pack — *"Small LLM in your Browser"* (sources, slide deck, narration) | docs |

---

## Quickstart

```bash
npm ci                            # reproducible install (peer setting is in .npmrc)

npm run serve:chat                # demo gallery      → http://localhost:4300
npx nx serve map                  # Cross-Border Desk → http://localhost:4200

npm run build:demo                # static gallery → dist/chat/
npx nx build map                  # separate static app → dist/map/
npm test                          # workspace Vitest tests
```

## Host and teach from this fork

1. Run `npm ci && npm run build:demo`. The built gallery in `dist/chat/` is a static SPA; host it **at the domain root** on HTTPS. Do not upload `node_modules/` or use the Nx development server as your public host.
2. Firebase Hosting is configured in [`firebase.json`](firebase.json) to publish `dist/chat`, rewrite deep links to `index.html`, and deploy only the `browser-ai-lab` target. [`.firebaserc`](.firebaserc) maps that target to the `browser-ai-lab` site in `cyberlion-sites-d0500`. After logging in, deploy locally with `npx firebase-tools deploy --only hosting:browser-ai-lab --project cyberlion-sites-d0500`. Reusing this fork for another site requires updating the project and target mappings. Firebase credentials are not committed.

   The GitHub workflows install Node 24, run `npm ci`, execute tests, and build with `npm run build:chat` (local Nx). Pushes to `main` deploy the live site; same-repository pull requests deploy preview channels. The Firebase service-account key is stored in the repository's `FIREBASE_SERVICE_ACCOUNT_CYBERLION_SITES_D0500` secret, not in source control.
3. On another static host, make all unknown paths rewrite to `/index.html` (for example, Netlify's `/* /index.html 200`, or nginx's `try_files $uri $uri/ /index.html;`). Set the site's publish directory to `dist/chat`. Serving the gallery under a subpath needs corresponding router and asset-base changes.
4. Share the HTTPS URL ending in `/status`. The **Three-minute demo path** starts with live capability checks, then translation, then a sample Recipe Workbench that can still be browsed without Gemini Nano. Each feature has an API documentation tab. Press **P** for presentation mode on a demo page; press **Esc** to exit.

For the separate `map` app, run `npx nx build map` and host `dist/map/` at the root of another site with the same SPA rewrite. It has a mock/offline tier for classroom demonstrations; it is **not** a payment processor.

**Before sharing:** test with the browser your audience will use. Core AI demonstrations require desktop Chrome with the relevant built-in APIs and downloaded models; some experimental demos also need flags or an origin-trial token on your deployed origin. A hosted URL does not grant those browser capabilities. The live `/status` page reports them per viewer. Initial downloads require a network connection and supported hardware. Optional SEO prerendering uses `npm run build:seo`; set `SITE_URL` to your deployment's HTTPS origin to generate canonical URLs and a sitemap. Without `SITE_URL`, it omits deployment-specific URLs.

---

## Requirements

The demos call Chrome's built-in AI, so they need a capable desktop Chrome:

- **Desktop Chrome 150+** on Windows, macOS, or Linux — the built-in AI APIs are desktop-only.
- **Gemini Nano on-device** — downloaded by Chrome on first use (a few GB; needs ~22 GB free disk and either >4 GB VRAM or 16 GB RAM). It can be disabled in Chrome settings, so demos always feature-detect and degrade gracefully.
- **Stable, no flag:** Prompt API (Chrome 148+), Summarizer / Translator / Language Detector (Chrome 138+).
- **Behind a flag / origin trial:** Writer, Rewriter, Proofreader, and WebMCP — enable via `chrome://flags` (each demo's in-app docs list the exact flag).

**Toolchain:** Node 20+ · Nx 21 · React 19 · TypeScript · Tailwind CSS · Vitest.

---

## Contributing

Contributions are welcome — see **[CONTRIBUTING.md](CONTRIBUTING.md)** for setup, the demo-page pattern, code style, and the pre-push checklist.

## License

[ISC](LICENSE).
