# Replit Agent Prompt — lucid:v2 polish + security pass

Paste this into Replit Agent (or the Replit AI chat inside the workspace) after importing the repo. It is self-contained and scoped so the agent does not invent changes outside its lane.

---

You are working inside a Next.js 15 App Router project called lucid:v2. The repo is already imported into Replit. Do not re-scaffold, do not change the design system, do not introduce new dependencies unless flagged below.

## Your scope

Run a three-pass polish and security review and report each finding before changing code.

### Pass 1 · Security scan (read-only first)

1. Search the repo for any leaked secrets. Check all files including git history. Flag anything that looks like an API key, token, password, or private URL.
2. Verify `.env.local`, `.env`, `.env*.local`, `tsconfig.tsbuildinfo`, and `node_modules/` are in `.gitignore`.
3. Confirm that no file outside `.env*` contains the strings `sk-ant-`, `AIza`, `apify_api_`, or the literal string `ANTHROPIC_API_KEY=`.
4. Audit every API route under `app/api/` for the following. Report findings before fixing.
   - Input validation on request bodies (`body.script`, `body.messages`, `body.handle`, `body.scenes`, `body.scores`).
   - Size limits on user-provided strings (reject scripts > 8000 chars, messages > 4000 chars, handles > 100 chars).
   - No server-side env vars are echoed back in responses.
   - No unhandled promise rejections. Every `await` is inside try/catch or an equivalent.
5. Check `next.config.ts` for any `bypass` flags, `ignoreBuildErrors`, or disabled security features. Report them.
6. Check that `.replit` does not expose additional unintended ports.

Output a markdown findings table: `severity | file | issue | recommendation`.

### Pass 2 · TypeScript + build correctness

1. Run `npm run build` and report any errors or warnings.
2. Run `npx tsc --noEmit` and fix any type errors surfaced.
3. Scan every React component for missing `key` props inside `.map()` render blocks.
4. Scan for unused imports and remove them.
5. Report any usage of `any`, `// @ts-ignore`, or `// @ts-expect-error` and justify or replace each.

### Pass 3 · Runtime polish

1. Run `npm run dev` and visit `/`, `/score`, `/research`, `/rewrite`, `/proof`. Report any console errors or warnings.
2. For each page, click every primary CTA and every nav link. Confirm no 404, no layout shift beyond 0.1 CLS.
3. Verify that fallback paths work by temporarily unsetting `ANTHROPIC_API_KEY` in-process (do not modify `.env.local`). Every surface should still render with authored mock content.
4. Confirm `/proof` loads `brain-scan.mp4` under 3 seconds on a Replit container. If not, suggest `<video preload="metadata">` or an H.264 re-encode.

## Hard constraints

- Do not change the visual design system (colors, typography, spacing).
- Do not rename or rebrand engines. "Alpha", "Beta", "Gamma" are locked.
- Do not introduce any package that pulls model vendors (Claude, Gemini, OpenAI) into the frontend bundle.
- Do not add public-facing model names to any copy. Refer to systems only.
- Do not add em-dashes to any prose, comment, or system prompt. Use period, comma, colon, or middot (·).

## Reporting format

For every finding, output a block like:

```
[SEV] path/to/file.ts:42
Issue: one-sentence description.
Fix: concrete change you'd make.
```

Then ask me to approve before editing. Start with Pass 1 only. Do not proceed to Pass 2 until I say "ship it."
