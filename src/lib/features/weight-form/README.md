# Weight Form

## Purpose

The `weight-form` feature tracks body weight, body measurements, and weight-loss goals for the Form tab. It owns the Form tab business logic, Supabase persistence, derived weight metrics, charts, entry screens, goal settings, and history tables; it does not own the mobile shell navigation, authentication UI, calorie tracking, activity tracking, exports, reminders, or medical advice.

## Public API

Exports from `index.ts`:

- `WeightFormPage: Component<{ data: WeightFormData }>`
  - Renders the `/form` dashboard, progress chart, measurement summary, and primary links.
  - `data`: entries, measurements, and goals loaded by the route server load.
- `WeightEntryPage: Component<{ data: WeightFormData; initialDate?: string; action?: WeightFormActionData | null }>`
  - Renders the `/form/weight` add/edit weight screen.
- `BodyMeasurementPage: Component<{ data: WeightFormData; initialDate?: string; action?: WeightFormActionData | null }>`
  - Renders the `/form/measurements` add/edit body measurements screen.
- `GoalRevisionPage: Component<{ data: WeightFormData; action?: WeightFormActionData | null }>`
  - Renders the `/form/goal` goal revision screen.
- `WeightHistoryPage: Component<{ data: WeightFormData }>`
  - Renders the `/form/history` weight, measurement, and goal history tables.
- Pure helpers:
  - `deriveWeightDashboard(input): WeightDashboard`
  - `buildDailyWeightMetrics(input): DailyWeightMetric[]`
  - `calculateTargetDate(goal): string`
  - `plannedWeight(goal, date): number | null`
  - `getForecastEndpoint(input): ForecastEndpoint | null`
  - Date/format helpers used by this feature UI.
- Constants:
  - `WEIGHT_TAGS`
  - `TAG_LABELS`
  - `STATUS_LABELS`
  - `DEFAULT_WEEKLY_LOSS_KG`
- Types:
  - `WeightEntry`, `BodyMeasurement`, `WeightGoal`, `WeightTag`
  - `DailyWeightMetric`, `WeightDashboard`, `WeightFormData`
  - form action/value types for route integration.

Exports from `index.server.ts`:

- `loadWeightFormData(context): Promise<WeightFormData>`
- `upsertWeightEntry(context, formData): Promise<ActionResultLike>`
- `deleteWeightEntry(context, formData): Promise<ActionResultLike>`
- `upsertBodyMeasurement(context, formData): Promise<ActionResultLike>`
- `deleteBodyMeasurement(context, formData): Promise<ActionResultLike>`
- `createGoalRevision(context, formData): Promise<ActionResultLike>`
- `isIsoDate(value): boolean`
- `todayIso(date?): string`

## Dependencies

- `$lib/components/ui/Button.svelte`
- `$lib/components/ui/Card.svelte`
- `$lib/components/ui/Input.svelte`
- `$lib/components/ui/Label.svelte`
- `@lucide/svelte`
- Supabase server client from `event.locals.supabase`

## Database

- Reads and writes `public.weight_entries`, `public.weight_entry_tags`, `public.body_measurements`, and `public.weight_goals`.
- Relies on user-owned RLS policies where `auth.uid() = user_id` for select, insert, update, and delete.
- `weight_entries` and `body_measurements` enforce unique `(user_id, date)`.
- `weight_goals` enforces one active goal per user with a partial unique index.
- Uses `public.upsert_weight_entry_with_tags(...)` so the weight row and tags update in one database transaction.
- Uses `public.create_weight_goal_revision(...)` so archiving the old active goal and creating the new revision happen atomically.
- `DAILY_WEIGHT_METRIC` is derived in TypeScript and is not persisted in v1.

## State

- Persistent state lives in Supabase and survives navigation.
- Route load data is shared by `/form/+layout.server.ts` and passed into each Form child page.
- Component-local runes state owns only selected dates and chart range.
- SvelteKit action data owns validation and success feedback after submissions.

## A11y notes

- `/form` and its child pages are protected by `requireUser()`; anonymous users are redirected to login.
- Forms use native `<form>` submissions, explicit labels, visible validation messages, and `role="alert"` for form-level errors.
- Chart SVGs are decorative to assistive tech and wrapped in containers with concise `role="img"` labels.
- History rows use semantic tables; entry dates are real links to the relevant edit screen.
- Icon-only date navigation buttons have `aria-label` values.

## Out of scope

- Custom user-defined tags.
- Export to CSV, JSON, or PDF.
- Notifications, reminders, gamification, or motivational copy.
- Food, calorie, workout, or medical guidance.
- Persisted daily metric tables/materialized views.
