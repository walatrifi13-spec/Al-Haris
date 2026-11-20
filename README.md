# Al Haris (الحارس)

An AI assistant that tells you, within seconds, whether a message, email, phone call or link is a scam, **before** you click or reply. Built for the cybercrime-prevention hackathon at 42 Abu Dhabi, with a UAE focus.

## 1. The problem

Most cybercrime starts with one message: a fake bank SMS, a "prize" link, a caller asking for an OTP, or a website that imitates a government service. The attacker does not hack a device; they pressure a person into acting quickly. In the Arab world the problem is harder because scams are written in Modern Standard Arabic, dialects, Arabizi and English, and many protection tools handle that mix poorly.

## 2. The solution

Al Haris is a web app with four tabs:

| Tab | What it does |
|---|---|
| Message & email check | Paste an SMS/WhatsApp message, an email, or what a caller said. An LLM returns a verdict (safe / suspicious / dangerous), a 0-100 score, the reasons, and the next steps, in simple Arabic. |
| How to spot fraud | Short guides: fake emails, scam calls, the "hang up and call the official number" rule, and UAE reporting channels (Aman 8002626 / SMS 2828, eCrime, MOI platform, 999). |
| Link verifier | Checks a URL against official UAE domain patterns (`*.gov.ae` and a short allow-list), and flags look-alike names, plain HTTP, raw IPs, punycode and URL shorteners. Fully offline, no data sent anywhere. |
| Alerts | A demo of the notification experience, plus the plan for a native app (see "What I left out"). |

## 3. Run it

Requirements: Node.js 18 or newer. **No `npm install` needed** (zero dependencies).

```bash
git clone <your-repo-url> && cd al-haris
node server.js                      # rules-only mode (works offline, no key)
# open http://localhost:3000
```

To enable the AI analysis, set an Anthropic API key:

```bash
ANTHROPIC_API_KEY=sk-ant-... node server.js        # macOS / Linux
# PowerShell:  $env:ANTHROPIC_API_KEY="sk-ant-..."; node server.js
```

Run the tests: `npm test` (Node's built-in test runner).

Environment variables (set in the terminal, never commit a key): `ANTHROPIC_API_KEY` (optional), `MODEL` (default `claude-sonnet-5-5`), `PORT` (default 3000).

## 4. Technical choices and trade-offs

- **LLM for the verdict, rules as a safety net.** A language model understands dialects, Arabizi and new scam wording without hand-written rules. The server falls back to a weighted keyword rule set if there is no key, no network or the model fails, so the app never gives a blank result. Trade-off: the rule set is crude and Arabic keyword matching has false positives.
- **Server-side proxy for the model.** The API key never reaches the browser, and the server controls input size (3,000 chars), rate limiting (20 requests/min/IP) and output validation.
- **Prompt-injection defence.** Scam text is untrusted. It is wrapped in tags, the system prompt says to treat it as data only, and the reply is parsed as strict JSON and validated (allowed levels, clamped score, capped list lengths) before reaching the UI.
- **Privacy by design.** Emails, phone numbers and Emirates ID patterns are redacted before text leaves the server. Nothing is stored or logged. See `TECHNICAL_DOCUMENTATION.md`.
- **Zero dependencies, plain HTML/CSS/JS.** Easy to audit, run and demo in a hackathon. Trade-off: no framework, so the UI code is manual.
- **Link verifier is deterministic.** Domain checks should be exact and explainable, not a model guess. Trade-off: it knows only domain patterns, not live reputation.

## 5. What I left out

- **Real-time alerts for incoming SMS, email and calls.** A website cannot read messages or calls in the background. This needs a native app: Android (with user permission and Google Play restrictions on SMS access, plus call screening) and iOS (which blocks reading messages and calls, but allows message-filter and caller-ID extensions).
- Live URL reputation (e.g. a threat-intelligence feed), file/image/QR analysis, voice-deepfake detection.
- Accounts, history and persistence (deliberately none, for privacy).
- A measured accuracy benchmark. The test set must be built from real, anonymized scam samples (see below).
- A distributed rate limiter and abuse protection suitable for production.

## 6. What I would do with more time

1. Build a labelled test set (about 50-100 Arabic, Arabizi and English samples) and report precision/recall, especially false alarms on genuine messages.
2. Add live URL reputation and a screenshot/QR check.
3. Ship the Android app with call screening and on-device pre-filtering, so most checks need no network.
4. Add a feedback button that lets users report a wrong verdict (with consent, anonymized).
5. Partner with banks and telecoms to keep the scam patterns current.

## 7. Project structure

```
server.js                   HTTP server, rate limit, LLM call, validation
rules.js                    offline fallback rules
privacy.js                  redaction of personal data
index.html                  the UI (Arabic, RTL)
basic.test.js               unit tests
TECHNICAL_DOCUMENTATION.md  architecture, model choices, privacy design
```

## 8. Development note

This project was built with AI assistance (Claude). The author reviewed, ran and is responsible for the code.
