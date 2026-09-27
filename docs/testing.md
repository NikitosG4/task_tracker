# Verification checklist

## Checked during stage 2

- JavaScript syntax check passed.
- Production build passed.
- Git diff whitespace check passed.
- Local environment file is ignored by Git.
- Login and registration screens render in the browser; switching between them works.
- Supabase Auth settings respond successfully: email signup enabled; email confirmation required.
- Anonymous task read returns HTTP 401 with PostgreSQL code 42501 (permission denied).

## User-reported results

The user confirmed registration, login, task creation, editing through the dialog, persistence after refresh, deletion, and logout/login work. These were user-run checks.

## Follow-up checks

- Change a task status directly from its dropdown. Confirm the counts and filters update and the value survives refresh.
- Simulate loss of network while changing status; confirm an error appears and the prior saved status is restored.
- Two-account privacy checks and deployed testing remain pending.

## Full authenticated test checklist

Use two accounts you control. Do not disable Row Level Security.

1. Register account A; confirm its email; log in.
2. Create a task with a title and description. Refresh and confirm it persists.
3. Edit its title, description, and status; refresh and confirm the changes persist.
4. Try all status filters and search.
5. Cancel a deletion and confirm the task remains, then delete a disposable task and confirm it stays deleted after refresh.
6. Log out and verify the task list is no longer shown. Log back in and verify your remaining tasks return.
7. Register and log in as account B. Confirm A's tasks are not visible.
8. Verify API-level ownership enforcement: B cannot select, update, or delete A's task by ID, and cannot insert a task with A's user_id. Use test-only records and each account's ordinary session.
9. Confirm a title consisting only of spaces is rejected. Enter HTML-like text and confirm it is displayed as text.
10. Check the layout on a phone-sized browser and repeat essential steps on the deployed site.

## Deployment remains pending

Set the deployed URL in Supabase's Site URL and redirect allowlist. Add both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to the hosting build environment, deploy, then test email confirmation on the deployed URL.
