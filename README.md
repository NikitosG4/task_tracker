# ED1 Task Tracker

A personal task tracker for Engineering Design 1 projects. Break project work into tasks, add notes, and track each task from **To do** to **In progress** to **Done**. Each account has its own task list.

- **Live application:** [task-tracker-mg.netlify.app](https://task-tracker-mg.netlify.app)
- **Repository:** [NikitosG4/task_tracker](https://github.com/NikitosG4/task_tracker)
- **Demo video (3–5 minutes, unlisted):** Pending recording and YouTube link.

## Features

- Email registration, email confirmation, login, and logout.
- Create, view, edit, and delete tasks stored in Supabase.
- Change status directly from each task’s dropdown; changes save automatically.
- Search task titles and descriptions and filter by status.
- Summary cards showing the number of tasks in each status.
- Database policies restricting task access to the signed-in owner.

## Technologies

- **Frontend:** JavaScript, HTML, CSS, and Vite.
- **Database:** Supabase PostgreSQL.
- **Authentication:** Supabase Auth.
- **Hosting:** Netlify.
- **Version control and AI tooling:** Git, GitHub, and Codex.

## Run locally

1. Install Node.js 22.12 or later (Node 24 LTS is also suitable).
2. Clone this repository and install dependencies:

   ```sh
   git clone https://github.com/NikitosG4/task_tracker.git
   cd task_tracker
   npm ci
   ```

3. Create your own Supabase project on the free plan. In its SQL Editor, run `supabase/schema.sql` once to create the tasks table and access policies.
4. Copy the example environment file:

   ```sh
   cp .env.example .env.local
   ```

   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to your Supabase project URL and publishable key. `.env.local` is ignored by Git. Do not use a secret or service-role key in the frontend.
5. In Supabase **Authentication → URL Configuration**, add `http://127.0.0.1:5173` to allowed redirect URLs. For a local-only project, also use it as the Site URL. For a deployed project, keep the live URL as the Site URL. Keep email confirmation enabled.
6. Start the application:

   ```sh
   npm run dev -- --port 5173 --strictPort
   ```

   Open `http://127.0.0.1:5173`. Register, confirm your email, and log in.
7. To build the production files, run `npm run build`. Output is written to `dist`.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Page entry point and metadata |
| `src/main.js` | Authentication screens, task interface, and database operations |
| `src/style.css` | Interface and responsive layout styles |
| `src/supabase.js` | Supabase client configured through environment variables |
| `supabase/schema.sql` | Tasks table, index, constraints, and row access policies |
| `.env.example` | Required configuration names, without real credentials |
| `netlify.toml` | Production build command and publish directory |
| `docs/testing.md` | Verified checks and remaining validation |

## Database and access control

The `tasks` table stores an ID, owner’s `user_id`, title, description, status, and creation timestamp. The owner references a Supabase Auth user. Row Level Security policies require the signed-in user’s ID to match the record’s `user_id` for viewing, creating, updating, and deleting tasks. Logged-out clients have no task-table privileges.

The browser uses a publishable key. Database grants and policies enforce access; hiding controls in the interface is not the security boundary.

## Deployment

The application is deployed publicly on Netlify. To deploy your own copy:

1. Import the GitHub repository into Netlify using the free plan.
2. Use branch `main`, build command `npm run build`, publish directory `dist`, and an empty base directory. These build settings are also in `netlify.toml`.
3. Before building, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to Netlify’s environment variables.
4. Set the deployed HTTPS address as Supabase’s Site URL and add it to allowed redirect URLs.
5. Verify that the site opens in an incognito window without requiring a Netlify account. Test registration, login, task operations, and refresh persistence on the deployed site.

## Verification

- Production build and JavaScript syntax checks passed.
- Anonymous access to the task table was rejected by Supabase.
- The project author confirmed registration, login/logout, task creation, editing, deletion, persistence after refresh, and direct status changes during local testing.
- The project author confirmed that a second account could not see the first account’s tasks, and the first account retained its tasks after signing back in.
- The deployed login page was verified publicly accessible, including the author’s incognito check.

Authenticated flows on the deployed site, direct cross-account API attempts, and network-failure handling are not yet recorded as verified. See [the testing checklist](docs/testing.md).

## AI assistance

Codex assisted with scaffolding, implementation, debugging, interface revisions, and documentation. Development used incremental Git commits. The project author configured Supabase and Netlify, tested the application, and requested usability improvements such as direct status changes and clearer task-count cards.
