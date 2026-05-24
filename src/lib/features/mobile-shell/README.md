# Mobile Shell

## Purpose

Provides the mobile-first app frame for the main product area: fixed max width, top title bar, and bottom tab navigation for `Intake`, `Shape`, `Activity`, and `Settings`. It defines navigation shell structure only and does not implement tracker business logic. It also owns cross-route navigation loading feedback for server-loaded screens.

## Public API

- `MobileShell` — `Component<{ children: Snippet }>`
  - Renders the mobile-width frame and bottom tab bar.
  - `children`: current route content snippet.
- `IntakeTab` — `Component`
  - Placeholder content for the intake tracker screen.
- `ActivityTab` — `Component`
  - Placeholder content for the activity tracker screen.
- `SettingsTab` — `Component`
  - Placeholder content for the settings screen.
- `APP_TABS` — `AppTab[]`
  - Tab configuration used by the shell.
- `getActiveTabId(pathname: string): AppTabId`
  - Maps pathname to active tab id.
- `AppTabId` — `'intake' | 'shape' | 'activity' | 'settings'`
- `AppTab` — `{ id: AppTabId; label: string; href: string; disabled?: boolean }`

## Dependencies

- `$lib/components/ui/Card.svelte`
- `$lib/features/theme-toggle`
- `$lib/utils/cn`
- `@lucide/svelte`
- `$app/state`

## Database

N/A

## State

Owns only presentational derived state for active tab resolution from the current pathname and current SvelteKit navigation. No persistent or cross-route writable state.

## A11y notes

- Bottom navigation uses semantic `<nav>` and link semantics.
- Current tab uses `aria-current="page"`.
- Pending navigation marks main content with `aria-busy` and exposes a screen-reader-only status.
- Disabled `Activity` tab is rendered as non-interactive content with `aria-disabled="true"`.

## Out of scope

- Calorie, form, or activity data models.
- Supabase integration.
- Charts, logging flows, and profile forms.
