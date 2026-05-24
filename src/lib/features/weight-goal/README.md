# Weight Goal

## Purpose

The `weight-goal` feature renders the `/shape/goal` screen for creating a new revision of the active weight goal. It does not render entry forms, charts, or history tables.

## Public API

Exports from `index.ts`:

- `WeightGoalPage: Component<{ data: WeightTrackingData; action?: WeightTrackingActionData | null }>`
  - `data`: entries and goals loaded by the Shape route layout.
  - `action`: optional SvelteKit action data for validation and success messages.

## Dependencies

- `$lib/components/ui/Button.svelte`
- `$lib/components/ui/Card.svelte`
- `$lib/components/ui/Input.svelte`
- `$lib/components/ui/Label.svelte`
- `$lib/components/ui/LinkButton.svelte`
- `$lib/features/weight-tracking`
- `@lucide/svelte`

## Database

N/A. Writes are submitted to route actions that call `weight-tracking` server APIs.

## State

- Form values are derived from action data and the current dashboard summary.
- Projected target date is derived locally from form values.

## A11y notes

- Inputs have explicit labels and inline validation messages.
- Form-level errors use `role="alert"`.
- Success messages use `role="status"`.

## Out of Scope

- Changing weekly-loss strategy.
- Deleting goals.
- Goal comparison views.
