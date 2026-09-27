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

The user confirmed registration, login, task creation, editing through the dialog, persistence after refresh, deletion, and logout/login work. The user also confirmed direct status changes and two-account task visibility isolation. These were user-run local checks.

## Follow-up checks

- Simulate loss of network while changing status; confirm an error appears and the prior saved status is restored.
- Direct cross-account API attempts and authenticated flows on the deployed site remain pending.

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

## Deployment

The app is deployed at https://task-tracker-mg.netlify.app. Public access to the login page was verified in the browser; the user also confirmed incognito access. The user reported configuring Supabase redirect URLs. Email confirmation, authenticated task operations, and persistence should still be checked on the live URL before submission.
