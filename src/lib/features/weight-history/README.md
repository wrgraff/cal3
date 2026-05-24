# Weight History

## Purpose

The `weight-history` feature renders the `/shape/history` read-only history for weight entries, body measurements, and goal revisions. It does not submit edits directly; date links route users to the relevant edit screen.

## Public API

Exports from `index.ts`:

- `WeightHistoryPage: Component<{ data: WeightTrackingData }>`
  - `data`: entries, measurements, and goals loaded by the Shape route layout.

## Dependencies

- `$lib/components/ui/Card.svelte`
- `$lib/components/ui/LinkButton.svelte`
- `$lib/features/weight-tracking`
- `@lucide/svelte`

## Database

N/A. Data is provided by route composition.

## State

- No persistent or component-local mutable state.
- Table rows are derived from `WeightTrackingData`.

## A11y notes

- Uses semantic `<table>` markup with screen-reader captions.
- Edit affordances are real links to task pages.

## Out of Scope

- Inline editing.
- Filtering, search, export, or pagination.
