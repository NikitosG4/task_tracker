# ED1 Task Tracker

A personal task tracker for an Engineering Design 1 project. Planned features: email registration, login/logout, and creating, viewing, editing, and deleting private tasks with To do, In progress, and Done statuses.

## Current status

Stage 1: local scaffold and database schema prepared. Authentication, task management, and live database verification are pending.

- Deployed application: pending final deployment.
- Unlisted YouTube demo (3–5 minutes): pending recording.

## Technologies

JavaScript, HTML, CSS, Vite, Supabase Auth and PostgreSQL, and Netlify hosting.

## Setup

1. Install a Node.js version supported by Vite and run `npm ci`.
2. Create a new Supabase project on the free plan.
3. Run `supabase/schema.sql` once in its SQL Editor to create the tasks table and per-user access policies.
4. Copy `.env.example` to `.env.local` and set the project URL and publishable key. Never put a secret or service-role key in the frontend.
5. Run `npm run dev` and open the printed local URL.
6. Run `npm run build` to create the deployable `dist` folder.

## Structure

- `src/main.js`: application entry point.
- `src/style.css`: interface styles.
- `supabase/schema.sql`: table, index, and per-user access policies.
- `netlify.toml`: build settings.

## Deployment after development

Import the public GitHub repository into Netlify. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in its environment settings before building. Build command: `npm run build`. Publish directory: `dist`. Set the deployed URL in Supabase Auth's Site URL and allowed redirect URLs. Add the deployed application and demo links to this README before submission.

## Verification planned

Test registration, email confirmation, login/logout, create/edit/delete, persistence after refresh, and isolation between two users. Repeat core flows on the deployed application.

## AI assistance

Developed using Codex for scaffolding, implementation, debugging, and documentation. The demo will explain the working application and project structure.
