# Weight Dashboard

## Purpose

The `weight-dashboard` feature renders the `/form` dashboard: current weight summary, progress chart, measurement chart, and navigation into Form-area tasks. It does not submit entries, update goals, or render history tables.

## Public API

Exports from `index.ts`:

- `WeightDashboardPage: Component<{ data: WeightTrackingData }>`
  - `data`: weight entries, body measurements, and goals loaded by the Form route layout.

## Dependencies

- `$lib/components/ui/Card.svelte`
- `$lib/components/ui/LinkButton.svelte`
- `$lib/features/weight-tracking`
- `@lucide/svelte`

## Database

N/A. Data is provided by route composition.

## State

- Component-local `$state` owns only the selected chart range.
- Persistent state is owned by `weight-tracking`.

## A11y notes

- Chart range controls use real `<button>` elements with `aria-pressed`.
- Primary task links are real anchors.
- Chart components expose concise labels for assistive tech.

## Out of Scope

- Entry editing.
- Goal updates.
- History tables.
