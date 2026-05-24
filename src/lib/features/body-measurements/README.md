# Body Measurements

## Purpose

The `body-measurements` feature renders the `/shape/measurements` screen for updating chest, waist, and hips measurements. It does not render weight entry forms, dashboard charts, goal settings, or history tables.

## Public API

Exports from `index.ts`:

- `BodyMeasurementPage: Component<{ initialDate?: string; initialChestCm?: string; initialWaistCm?: string; initialHipsCm?: string; action?: WeightTrackingActionData | null }>`
  - `initialDate`: optional selected date from the route query string.
  - `initialChestCm`: optional prefilled chest value passed from navigation context.
  - `initialWaistCm`: optional prefilled waist value passed from navigation context.
  - `initialHipsCm`: optional prefilled hips value passed from navigation context.
  - `action`: optional SvelteKit action data for validation and success messages.

## Dependencies

- `$lib/components/ui/Button.svelte`
- `$lib/components/ui/Input.svelte`
- `$lib/components/ui/Label.svelte`
- `$lib/components/ui/LinkButton.svelte`
- `$lib/features/weight-tracking`
- `@lucide/svelte`

## Database

N/A. Writes are submitted to route actions that call `weight-tracking` server APIs.

## State

- Component-local `$state` owns selected date and the three measurement inputs.
- Form values are sourced from action data first, then initial values from route context.

## A11y notes

- The back action uses an icon + text `<a>` and keeps title centered.
- Inputs have explicit labels and inline validation messages.
- Form-level errors use `role="alert"`.

## Out of Scope

- Custom measurement fields.
- Weight entries.
- Goal revisions.
- Deleting existing measurement entries.
