# ED1 Task Tracker

A personal task tracker for an Engineering Design 1 project. Features: email registration, login/logout, and creating, viewing, editing, and deleting private tasks with To do, In progress, and Done statuses.

## Current status

Stage 2: registration, login/logout, task CRUD, direct status dropdowns, search, and status filters implemented. The user has confirmed core authenticated flows. Direct dropdown testing, two-user isolation checks, and deployment are pending.

- Deployed application: pending final deployment.
- Unlisted YouTube demo (3–5 minutes): pending recording.

## Technologies

JavaScript, HTML, CSS, Vite, Supabase Auth and PostgreSQL, and Netlify hosting.

## Setup

1. Install a Node.js version supported by Vite and run `npm ci`.
2. Create a new Supabase project on the free plan.
3. Run `supabase/schema.sql` once in its SQL Editor to create the tasks table and per-user access policies.
4. Copy `.env.example` to `.env.local` and set the project URL and publishable key. Never put a secret or service-role key in the frontend.
5. In Supabase Authentication → URL Configuration, add `http://localhost:5173` and `http://127.0.0.1:5173` to allowed redirect URLs. During local development set Site URL to `http://localhost:5173`. Keep email confirmation enabled; confirm your email before logging in.
6. Run `npm run dev` and open the printed local URL.
7. Run `npm run build` to create the deployable `dist` folder.

## Structure

- `src/main.js`: application entry point.
- `src/style.css`: responsive interface styles.
- `src/supabase.js`: Supabase connection using environment variables.
- `supabase/schema.sql`: table, index, and per-user access policies.
- `netlify.toml`: build settings.

## Deployment after development

Import the public GitHub repository into Netlify. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in its environment settings before building. Build command: `npm run build`. Publish directory: `dist`. Set the deployed URL in Supabase Auth's Site URL and allowed redirect URLs. Add the deployed application and demo links to this README before submission.

## Verification

The production build, initial browser rendering, and anonymous read denial have been checked. The user has confirmed core authenticated task operations. Direct status dropdowns and two-user isolation still need testing. See [the verification checklist](docs/testing.md). Repeat core flows on the deployed application before submission.

## AI assistance

Developed using Codex for scaffolding, implementation, debugging, and documentation. The demo will explain the working application and project structure.
