# SmogShield — Security & Privacy Architecture

This document describes the security controls, threat mitigations, and data privacy safeguards implemented in SmogShield.

---

## 🛡️ Threat Model & Attack Mitigations

SmogShield follows defense-in-depth principles across all architectural tiers:

| Threat Vector                     | Risk Level | Implemented Mitigation                                                                                                                                                                                                              | Verification Mechanism                               |
| :-------------------------------- | :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| **Prompt Injection**              | High       | User free-text is stripped of non-printable ASCII control characters (`[\x00-\x1F\x7F-\x9F]`) and HTML tags; structured facts are passed inside explicit boundary delimiters; LLM output is strictly validated against Zod schemas. | `tests/lib/sanitize.test.ts` & API schema tests      |
| **Credential Leakage**            | Critical   | Server-only environment validator (`src/lib/env.ts`) using Next.js `import "server-only"`. API keys are never prefixed with `NEXT_PUBLIC_` and never bundled into client JS. `.env*` files are strictly gitignored.                 | Pre-commit gitignore audit & build tree inspection   |
| **PII & Location Tracking**       | Medium     | User coordinates are systematically rounded to 2 decimal places ($\approx 1.1\,\text{km}$ resolution) immediately upon receipt. IP addresses and geolocation coords are redacted from structured logs.                              | `src/schemas/profile.ts` & `src/lib/logger.ts` tests |
| **API Abuse / Denial of Service** | Medium     | In-memory token-bucket rate limiter enforcing 10 requests per minute per IP on all `/api/*` endpoints.                                                                                                                              | `tests/lib/rateLimit.test.ts`                        |
| **Cross-Site Scripting (XSS)**    | High       | Strict Content Security Policy (CSP) configured in `next.config.ts`; `script-src 'self' 'unsafe-eval'`; React automatic JSX escaping; inline SVGs sanitized.                                                                        | CSP header inspection & Next.js config audit         |
| **Clickjacking & MIME-Sniffing**  | Medium     | HTTP security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.                                                                                              | `next.config.ts` headers declaration                 |
| **Supply Chain Vulnerabilities**  | Medium     | Verified dependencies with zero production vulnerabilities (`npm audit --omit=dev` reports 0 vulnerabilities).                                                                                                                      | Continuous CI audit check                            |

---

## 🔒 Server-Side Secrets Isolation

Environment variables are validated on server startup through `src/lib/env.ts`:

```typescript
import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3.1-flash-lite"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});
```

- Any attempt to import `src/lib/env.ts` from a client component results in a compile-time Next.js build error.
- All client telemetry, UI state, and network calls communicate solely through authenticated/rate-limited Next.js route handlers (`/api/plan`, `/api/chat`, `/api/geocode`).

---

## 🧼 Prompt Sanitization & Jailbreak Defense

User inquiries submitted to the follow-up chat endpoint (`/api/chat`) pass through two defensive layers:

1. **Deterministic Cleansing (`src/lib/sanitize.ts`):**
   - Strips dangerous control characters and raw HTML:
     ```typescript
     export function sanitizePromptData(input: string): string {
       return input
         .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
         .replace(/<[^>]*>/g, "")
         .trim();
     }
     ```
2. **Context Delimitation & Topic Scoping (`src/services/gemini.ts`):**
   - System prompts instruct the LLM:
     > _"You are SmogShield AI. You answer user questions strictly about air pollution, smog safety, and respiratory protection. If the user asks about unrelated topics (e.g. coding, politics, recipes), politely decline and redirect to air quality."_
   - Input questions are quarantined within explicit demarcation boundaries.

---

## 🌐 HTTP Security Headers

Configured in `next.config.ts`:

```typescript
{
  key: "Content-Security-Policy",
  value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://air-quality-api.open-meteo.com https://geocoding-api.open-meteo.com https://generativelanguage.googleapis.com; font-src 'self' data:; object-src 'none'; frame-ancestors 'none';"
},
{ key: "X-Frame-Options", value: "DENY" },
{ key: "X-Content-Type-Options", value: "nosniff" },
{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" }
```

---

## 🛑 Vulnerability Reporting

If you discover a security vulnerability in SmogShield, please report it privately via GitHub Security Advisories or by emailing the project maintainer. Please do not disclose vulnerabilities in public issues or discussion forums.
