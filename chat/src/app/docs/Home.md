## Built-in AI setup — Chrome Canary 157

Desktop Chrome 148+ provides the Prompt API without a flag; Summarizer, Translator and Language Detector have been stable since Chrome 138. First use may download a model or language pack. Check each API with `availability()` in DevTools.

In Canary, if a feature is missing, open the relevant `chrome://flags` entry, set it to **Enabled**, then relaunch:

| Feature | Canary flag | Availability check |
| --- | --- | --- |
| Prompt API | `chrome://flags/#prompt-api` | `await LanguageModel.availability({ expectedOutputs: [{ type: 'text', languages: ['en'] }] })` |
| Multimodal input | `chrome://flags/#prompt-api-multimodal-input` | `await LanguageModel.availability({ expectedInputs: [{ type: 'image' }] })` |
| Structured output | `chrome://flags/#prompt-api` (stable) | `session.prompt(text, { responseConstraint: schema })` |
| Writer | `chrome://flags/#writer-api` | `await Writer.availability()` |
| Rewriter | `chrome://flags/#rewriter-api` | `await Rewriter.availability()` |
| Proofreader | `chrome://flags/#proofreader-api` | `await Proofreader.availability({ expectedInputLanguages: ['en'] })` |
| Embeddings | `chrome://flags/#semantic-embedder-api` | `await SemanticEmbedder.availability()` |
| WebMCP | `chrome://flags/#enable-webmcp-testing` | `'modelContext' in document` |

For Summarizer, use `await Summarizer.availability()`; for Language Detector, `await LanguageDetector.availability()`; for translation, `await Translator.availability({ sourceLanguage: 'en', targetLanguage: 'es' })`. Manage translation packs at `chrome://on-device-translation-internals/` and troubleshoot model downloads at `chrome://on-device-internals`.

The former `BypassPerfRequirement` model flag is not present in Canary 157. Flag IDs above were checked against Chromium's `about_flags.cc` for version 157.0.8081.0; check the current `chrome://flags` UI when your Canary updates.
