# Auth

Auth is an **optional module** in this template. Some projects need it, some do not. You make the decision once, at template-init time, by answering `pnpm init-project`'s question:

> _Keep the optional auth module? (yes / no)_

- **Yes** → the module stays, you configure providers, you get login/logout flows out of the box.
- **No** → `pnpm init-project` removes the `src/lib/features/auth/`, `src/lib/auth/`, the `(auth)` route group, and auth-related env vars/docs. The dependency list stays the same (Supabase is still used for the database).

This document covers the module when it is kept.

## What's Included

When the module is enabled, you get:

- **Email + password sign-in / sign-up** (Supabase Auth).
- **Magic link sign-in** (passwordless email link).
- **Google OAuth** (optional — needs you to set up an OAuth app, see below).
- A login screen at `/login` and signup at `/signup`.
- Server-side session via cookies (using `@supabase/ssr`).
- A `requireUser()` helper for protected pages and endpoints.
- An optional admin role via `ADMIN_EMAILS` env var.

## How Sessions Work

Sessions are stored in cookies, managed by `@supabase/ssr`. The flow:

1. User signs in → Supabase returns access + refresh tokens.
2. Tokens written to HTTP-only cookies (server side).
3. On every request, `hooks.server.ts` creates a per-request Supabase client and attaches it to `event.locals.supabase`.
4. Routes that need an authenticated user call `locals.safeGetUser()` or `requireUser(locals)`. This uses `supabase.auth.getUser()`, so the user is authenticated by Supabase Auth instead of trusted from cookie storage.
5. Client-side, a `getUser()` call against the browser client picks up the same session via the cookies.

The session is automatically refreshed on the server when the access token is near expiry.

## Adding the Module to a New Project

If `pnpm init-project` removed the module and you later want it back:

```bash
# Re-add it from the template (one-off):
git remote add template <template-repo-url>
git fetch template
git checkout template/main -- src/lib/features/auth src/lib/auth src/routes/\(auth\) docs/AUTH.md

# Wire it up: add the env vars to .env.example and your .env
# Re-run pnpm db:push if your template version includes auth-specific migrations
# Re-run pnpm install if deps changed between versions
```

## Configuration

### Providers

Edit `src/lib/auth/providers.ts` to enable/disable providers:

```ts
export const providers = {
  emailPassword: true,
  magicLink: true,
  google: true, // requires GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
  github: false
  // ...
};
```

Disabling a provider hides it from the login UI. The provider also needs to be enabled/disabled in your Supabase project (Dashboard → Authentication → Providers).

### Google OAuth setup

1. Create an OAuth client in Google Cloud Console:
   - Authorized JavaScript origins: your app URL (e.g. `http://localhost:5173`, `https://yourapp.netlify.app`).
   - Authorized redirect URIs: your Supabase auth callback (Supabase → Auth → Providers → Google shows you the URL).
2. Copy client ID and secret into Supabase Dashboard → Authentication → Providers → Google.
3. Enable Google in `src/lib/auth/providers.ts`.

### Magic links and email

Configure SMTP in Supabase Dashboard → Authentication → SMTP Settings. Recommended: Resend, Postmark, or AWS SES.

### Admin role

Set `ADMIN_EMAILS` in `.env` (comma-separated):

```env
ADMIN_EMAILS="you@example.com,coauthor@example.com"
```

When `locals.safeGetUser()` validates a user, it checks the user's email against this list and adds an `isAdmin: boolean`. RLS policies and route guards can use it:

```ts
// +page.server.ts
export const load = async ({ locals }) => {
  const user = await locals.safeGetUser();

  if (!user?.isAdmin) {
    throw redirect(303, '/');
  }
  // ...admin-only data
};
```

For more robust roles (multiple roles, runtime-editable), introduce a `profiles` table with a `role` column and read it after `safeGetUser()` validates the auth user.

## Protected Routes

The `(auth)` route group covers login/signup. To protect other pages, use the `requireUser()` helper:

```ts
// src/routes/dashboard/+page.server.ts
import { requireUser } from '$lib/auth/require-user';

export const load = async ({ locals }) => {
  const user = await requireUser(locals);
  // user is guaranteed non-null here; otherwise requireUser throws a redirect to /login
  return { user };
};
```

For app-wide protection, put `requireUser()` in the nearest route group layout:

```ts
// src/routes/(app)/+layout.server.ts
import { requireUser } from '$lib/auth';

export const load = async ({ locals, url }) => ({
  user: await requireUser(locals, { next: url.pathname })
});
```

For client-side conditional UI on a public page, expose a user from that page or layout by calling `locals.safeGetUser()`:

```ts
// src/routes/public/+page.server.ts
export const load = async ({ locals }) => ({ user: await locals.safeGetUser() });
```

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  let { data } = $props();
  let user = $derived(data.user);
</script>

{#if user}
  <p>Welcome, {user.email}</p>
{:else}
  <a href="/login">Log in</a>
{/if}
```

## Sign Out

The sign-out endpoint lives at `src/routes/signout/+server.ts`. It is a standalone `POST` handler — not part of the `(auth)` route group — so it is reachable from any layout or page in the app, including ones outside the auth flow.

Use a plain form `POST` to `/signout` so auth cookies are cleared on the server:

```svelte
<form method="POST" action="/signout">
  <button type="submit">Sign out</button>
</form>
```

## RLS and Auth

RLS policies refer to the authenticated user via `auth.uid()`:

```sql
CREATE POLICY "users can read their own data"
  ON some_table FOR SELECT
  USING (auth.uid() = user_id);
```

When the user is anonymous (not signed in), `auth.uid()` returns `NULL` and the policy fails — the row is invisible.

See [`DATABASE.md`](./DATABASE.md) for full RLS patterns.

## Common Mistakes

| Mistake                                                | Fix                                                                                                                                                                                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calling `supabase.auth.signOut()` but session persists | Use the `/signout` POST endpoint (`src/routes/signout/+server.ts`), which clears cookies on the server. A `<form method="POST" action="/signout">` is the correct pattern.                                              |
| Login redirect loop                                    | Check that `requireUser` isn't applied to `/login` itself.                                                                                                                                                              |
| Magic link email never arrives in prod                 | SMTP not configured. Dashboard → Auth → SMTP.                                                                                                                                                                           |
| `auth.uid()` returns null in a policy                  | The query was made with the publishable key but without the user's session cookies. Make sure you're using `locals.supabase` (server) or the browser client (which carries cookies), not a manually constructed client. |
| `ADMIN_EMAILS` change not picked up                    | Restart dev server after changing `.env`. The value is read from server env in the auth hook.                                                                                                                           |

For Supabase Auth deep dives: <https://supabase.com/docs/guides/auth>.
