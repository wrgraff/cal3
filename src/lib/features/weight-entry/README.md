# Weight Entry

## Purpose

The `weight-entry` feature renders the `/form/weight` screen for adding, editing, and deleting daily weight entries. It does not render dashboard charts, body measurement forms, goal settings, or history tables.

## Public API

Exports from `index.ts`:

- `WeightEntryPage: Component<{ data: WeightTrackingData; initialDate?: string; action?: WeightTrackingActionData | null }>`
  - `data`: entries loaded by the Form route layout.
  - `initialDate`: optional selected date from the route query string.
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

- Component-local `$state` owns the selected date and one-time initial date application.
- Form values are derived from action data and the selected entry.

## A11y notes

- Date navigation uses icon-only `<button>` elements with `aria-label`.
- Inputs have explicit labels and inline validation messages.
- Form-level errors use `role="alert"`.

## Out of Scope

- Body measurements.
- Goal revisions.
- Bulk edits or imports.
