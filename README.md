# Incision

Incision is a virtual dissection lab that runs in the browser. Pick an organism, rotate its 3D anatomical model, select organs to read about them, hide or show body systems, and take a short guided tour. A Gemini-powered “Quiz me” button asks you a question about whichever organ you’ve selected

## Features

- **3D viewer.** Orbit, zoom and pan around the model. Clicking an organ flies the camera to it, and the other organs fade back.
- **Organ info panel.** Shows a description for the selected part, written for students.
- **Body systems sidebar.** Toggles whole systems (digestive, circulatory, respiratory, urinary, external) or single organs on and off.
- **Skin fade.** The skin turns see-through as you zoom in, so you can see the organs inside.
- **Guided tour.** A short tour that steps through the heart and stomach, with Back, Next and Skip.
- **Quiz me.** Asks one multiple-choice question about the selected organ, then checks your answer and explains it. Uses Google Gemini.

## Tech stack

| Part | Tools |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Backend | FastAPI (Python), Pydantic, google-genai |
| 3D | three.js, React Three Fiber, drei, three-mesh-bvh |
| Animation | Motion |

## Prerequisites

- Node.js 20.9 or newer, with npm
- Python 3.9 or newer
- [uv](https://docs.astral.sh/uv/), which runs the backend
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). You only need this for Quiz me.

## Getting started

Run the frontend and the backend in two separate terminals.

### 1. Backend

```bash
cd backend
echo "GEMINI_API_KEY=your-key-here" > .env
uv run fastapi dev
```

The API starts at http://localhost:8000. Open http://localhost:8000/docs to see the interactive API docs. `backend/.env` is gitignored, so your key is never committed.

### 2. Frontend

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

The frontend expects the API at `http://localhost:8000`. If yours runs somewhere else, set `NEXT_PUBLIC_API_URL` in a `.env.local` file in the project root.

If the backend isn't running, the 3D viewer still works, but organ descriptions, body systems, the tour and Quiz me will be empty or unavailable.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | Health check |
| GET | `/models/{slug}/content` | Parts, groups and tour for a model. Returns empty lists if the model has no content file. |
| POST | `/chat` | Sends a conversation to Gemini, along with the selected part's notes. Quiz me uses this. |

## Adding a model

1. **Add the file.** Put the `.glb` in `public/models/`, compressed (see below).
2. **Register it.** Add an entry to `MODELS` in `app/data/models.ts` with a `slug`, `name`, `category` and `path`.
3. **Write its content (optional).** Create `backend/src/api/content/<slug>.json` with `parts`, `groups` and `tour`, using `frog.json` as a template. The keys under `parts` must match the object names in the GLB.

## Compressing models

GitHub rejects files over 100 MB, and raw Blender exports are often bigger than that. Keep the raw export in `models-source/`, which is gitignored, and commit only the compressed copy:

```bash
npx @gltf-transform/cli resize models-source/Model.glb /tmp/a.glb --width 1024 --height 1024
npx @gltf-transform/cli webp /tmp/a.glb /tmp/b.glb
npx @gltf-transform/cli meshopt /tmp/b.glb public/models/Model.glb
```

These steps shrink the textures and compress the geometry without removing any detail. For example, they took the frog from 194 MB to 14 MB.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Next.js dev server |
| `npm run build` | Builds the frontend for production |
| `npm run start` | Serves the production build |
| `npm run lint` | Runs ESLint |
