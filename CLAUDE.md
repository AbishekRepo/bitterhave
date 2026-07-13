# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Two loosely-coupled pieces sharing one repo:

1. **Next.js web app** (repo root) — a screenshot-to-AI-answer pipeline: receives an uploaded screenshot, OCRs it, sends the extracted text to an LLM, and displays the answer.
2. **`python/` — a standalone desktop utility** (`screen_index.py`) — a system-tray screenshot tool (Windows) that captures the screen on a hotkey (`HOTKEY` in `screen_index.py`, currently F8) and uploads the image to the Next.js app's `/api/upload` endpoint. It has its own dependencies (`keyboard`, `Pillow`, `pystray`, `requests`) and its own `python/README.md`; it is not part of the Next.js build.

## Commands (Next.js app)

Run from the repo root:

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (`next/core-web-vitals` + `next/typescript`, via `eslint.config.mjs`)

There is no test suite in this repo currently.

### Python tool

- Dependencies: `pip install keyboard Pillow pystray requests`
- Run: `python python/screen_index.py`, or launch hidden via `python/screenshot_tool.bat`
- Requires the Next.js dev server running locally, since it POSTs to `API_ENDPOINT` (hardcoded to `http://localhost:3000/api/upload` in `screen_index.py`)

## Architecture / request flow

The whole app is a single pipeline, spread across three API routes plus one page. To understand a change in any one file, know the full chain:

1. `python/screen_index.py` grabs a screenshot on the hotkey and POSTs it as multipart form data (`image`, `image_id`, `filename`, `timestamp`) to **`app/api/upload/route.js`**.
2. **`/api/upload`**:
   - Converts the image to base64 and sends it to the OCR.space API (`OCR_SPACE_API_KEY`) to extract text.
   - Wraps the extracted text in a fixed instruction prompt (telling the model to identify whether it's a question/code snippet/error log/etc. and answer it, or return a fixed "No question found" string otherwise).
   - Calls its own **`/api/ai`** route (internal fetch) with that prompt.
   - Stores the combined result (AI response + filename/timestamp/imageId/extractedText) in **process-global variables**: `global.aiResponses` (array, all responses) and `global.lastAIResponse` (most recent). There is no database write here — despite Supabase being a dependency, this pipeline currently uses in-memory globals only. This means state resets on server restart and will not behave correctly across multiple serverless instances/processes.
3. **`app/api/ai/route.js`** is a thin proxy to OpenRouter's chat completions API (`https://openrouter.ai/api/v1/chat/completions`, model `openai/gpt-oss-120b:free`), using `OPENROUTER_API_KEY`, `SITE_URL`, `SITE_NAME` from env.
4. **`app/api/response/route.js`** (`GET`) just returns whatever is currently in `global.lastAIResponse`, 404 if nothing has landed yet.
5. **`app/page.tsx`** (client component) polls `/api/response` (button-triggered, with up to 3 automatic retries at 10s intervals on failure/absence) and renders the AI's message content via **`app/components/ResponseDisplay.tsx`**.
6. **`ResponseDisplay.tsx`** parses the raw LLM response string into an ordered sequence of text / fenced-code-block / markdown-table segments (via regex scanning, not a markdown library) and renders each segment with its own styling.

When changing the prompt sent to the model, edit the template string in `app/api/upload/route.js` (not `/api/ai`, which is a generic passthrough). When changing how responses are stored/retrieved, remember both `/api/upload` (writer) and `/api/response` (reader) touch the same `global.*` state.

## Environment variables

Defined in `.env.local` (gitignored, not committed):

- `OPENROUTER_API_KEY`, `SITE_URL`, `SITE_NAME` — used by `/api/ai` for the OpenRouter call
- `OCR_SPACE_API_KEY` — used by `/api/upload` for OCR.space
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase client is a dependency but not currently wired into any route (see above)
- `NEXT_PUBLIC_BASE_URL`, `GEMINI_API_KEY` — present in env but not currently referenced in `app/`
