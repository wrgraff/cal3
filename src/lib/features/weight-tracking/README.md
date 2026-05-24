# Weight Tracking

## Purpose

The `weight-tracking` feature is the shared domain layer for weight entries, body measurements, goals, derived progress metrics, and Supabase persistence. It does not render route screens, own navigation, or decide page layout.

## Public API

Exports from `index.ts`:

- Pure helpers:
  - `deriveWeightDashboard(input): WeightDashboard`
  - `buildDailyWeightMetrics(input): DailyWeightMetric[]`
  - `calculateTargetDate(goal): string`
  - `plannedWeight(goal, date): number | null`
  - `getForecastEndpoint(input): ForecastEndpoint | null`
  - date and formatting helpers used by Form-area features.
- Constants:
  - `WEIGHT_TAGS`
  - `TAG_LABELS`
  - `STATUS_LABELS`
  - `DEFAULT_WEEKLY_LOSS_KG`
- Types:
  - `WeightTrackingData`, `WeightTrackingActionData`
  - `WeightEntry`, `BodyMeasurement`, `WeightGoal`, `WeightTag`
  - dashboard, metric, form value, and status types.

Exports from `index.server.ts`:

- `loadWeightTrackingData(context): Promise<WeightTrackingData>`
- `loadWeightEntryData(context): Promise<WeightTrackingData>`
- `loadBodyMeasurementData(context): Promise<WeightTrackingData>`
- `loadWeightGoalData(context): Promise<WeightTrackingData>`
- `upsertWeightEntry(context, formData): Promise<ActionResultLike>`
- `deleteWeightEntry(context, formData): Promise<ActionResultLike>`
- `upsertBodyMeasurement(context, formData): Promise<ActionResultLike>`
- `deleteBodyMeasurement(context, formData): Promise<ActionResultLike>`
- `createGoalRevision(context, formData): Promise<ActionResultLike>`
- `isIsoDate(value): boolean`
- `todayIso(date?): string`

## Dependencies

- `$lib/types/database.types`
- Supabase server client from `event.locals.supabase`
- `@sveltejs/kit` `fail`

## Database

- Reads and writes `public.weight_entries`, `public.weight_entry_tags`, `public.body_measurements`, and `public.weight_goals`.
- Relies on user-owned RLS policies where `auth.uid() = user_id` for select, insert, update, and delete.
- `weight_entries` and `body_measurements` enforce unique `(user_id, date)`.
- `weight_goals` enforces one active goal per user with a partial unique index.
- Uses `public.upsert_weight_entry_with_tags(...)` so the weight row and tags update in one database transaction.
- Uses `public.create_weight_goal_revision(...)` so archiving the old active goal and creating the new revision happen atomically.

## State

- Persistent state lives in Supabase.
- Derived dashboard state is computed from `WeightTrackingData`.
- This feature owns no component-local UI state.

## A11y notes

N/A. This feature exports domain helpers and server actions only.

## Out of Scope

- Route components and visual layout.
- Mobile shell navigation.
- Food, activity, notifications, exports, or medical guidance.
