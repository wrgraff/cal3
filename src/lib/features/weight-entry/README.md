# Weight Entry

## Purpose

The `weight-entry` feature renders the `/shape/weight` screen for adding a daily weight entry with one weight field, time-of-day selector, and tags. It does not render dashboard charts, body measurement forms, goal settings, or history tables.

## Public API

Exports from `index.ts`:

- `WeightEntryPage: Component<{ initialDate?: string; initialWeightKg?: string; action?: WeightTrackingActionData | null }>`
  - `initialDate`: optional selected date from the route query string.
  - `initialWeightKg`: optional prefilled current weight passed from navigation context.
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

- Component-local `$state` owns selected date, time-of-day, and weight input.
- Weight default is sourced from `initialWeightKg` when no action values exist.

## A11y notes

- Date navigation and +/- controls use icon-only `<button>` elements with `aria-label`.
- Inputs have explicit labels and inline validation messages.
- Form-level errors use `role="alert"`.

## Out of Scope

- Body measurements.
- Goal revisions.
- Bulk edits or imports.
- Deleting existing weight entries.
