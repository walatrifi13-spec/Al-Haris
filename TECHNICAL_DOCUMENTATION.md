# Al Haris: Technical Documentation

## 1. Architecture

```
Browser (HTML/CSS/JS, Arabic RTL)
   |  POST /api/analyze {text, kind}
   v
Node.js server (no dependencies)
   |-- validate input (type, 3,000 char cap) and rate limit (20/min/IP)
   |-- redact personal data (emails, phone numbers, Emirates ID)
   |-- call LLM (Anthropic Messages API) with a fixed system prompt
   |-- validate the JSON reply (level, score, reasons, actions)
   '-- on any failure or no API key: offline rules fallback
   v
Verdict {level, score, reasons, actions} + source label
```

The link verifier runs entirely in the browser. The educational tab is static content.

## 2. Model choices

| Decision | Choice | Why |
|---|---|---|
| Detection engine | General-purpose LLM (default `claude-sonnet-5-5`, configurable via `MODEL`) | Handles MSA, dialects, Arabizi and English in one model; adapts to new scam wording without retraining. |
| Output format | Strict JSON with fixed keys | Predictable UI rendering; easy to validate. |
| Explanations | Short Arabic reasons and actions | Users learn to recognize the trick, which protects them even without the tool. |
| Fallback | Weighted keyword rules (`rules.js`) | Works offline and when the model is unavailable; deterministic and testable. |
| Link checking | Deterministic domain rules, not the model | Must be exact and explainable; no data leaves the browser. |

Trade-offs: LLM verdicts can be wrong in both directions, so the UI presents results as help, not a final judgment, and always advises verifying through the official channel. The model also adds latency and cost per check; rules-only mode removes both.

## 3. Privacy design

- **Data minimisation:** emails, phone numbers and Emirates ID numbers are replaced with placeholders before any text reaches the model.
- **No storage:** the server keeps no message content, database or logs of inputs. Only a short in-memory timestamp list per IP is kept for rate limiting.
- **Key isolation:** the API key lives only in a server environment variable.
- **Prompt-injection resistance:** input is delimited and declared as data; the reply must be valid JSON and is sanitised (allowed levels, clamped score, truncated strings) before display. The UI inserts text with `textContent`, never as HTML.
- **Transport and headers:** a Content-Security-Policy, `nosniff` and `no-referrer` headers are set on every response. Use HTTPS when deployed.
- **User guidance:** the UI warns users not to enter real card numbers or passwords.
- **Consent for any future native app:** processing on-device where possible, explicit permissions, no content retention.

## 4. Threat model (short)

| Risk | Mitigation |
|---|---|
| Prompt injection inside a scam message | Data-only framing, strict JSON validation |
| Leaking personal data to a third-party model | Redaction before the call, no storage |
| Abuse / cost exhaustion | Input cap and per-IP rate limit (single-instance only) |
| False sense of safety | Wording of results; reminder to verify via official numbers |
| Fake "official" links passing the checker | Exact suffix matching on the parsed hostname (`gov.ae.evil.com` fails) |

## 5. Evaluation plan

Collect 50-100 anonymized samples (scam and genuine, Arabic/Arabizi/English). Record precision and recall for "dangerous", and the false-alarm rate on genuine messages. Report results in the presentation. (Results are not included here because they have not been measured yet.)

## 6. Limitations

See "What I left out" in the README. The main one: real-time interception of SMS, email and calls requires a native mobile app.
