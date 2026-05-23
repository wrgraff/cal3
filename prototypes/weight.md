# Weight Tracker Web App — AI Agent Specification

## 1. Goal

Create a compact personal web application for tracking body weight and body measurements over time.

The app is intended for one user. The core task is to track progress toward a target weight using morning weight as the main signal, while reducing noise from daily fluctuations through smoothing and trend visualization.

The app should include:

- daily morning and evening weight tracking;
- retrospective data entry for any date;
- target weight tracking with an automatically calculated target date;
- progress comparison against the planned weight-loss line;
- simple forecast based on the actual average pace;
- weekly body measurements: chest, waist, hips;
- charts, overview cards, and realistic test data;
- clean, calm, minimal English UI.

## 2. Product Scope

### MVP scope

Build a working frontend web app with design, code, and test data.

Required MVP features:

- Add, edit, and delete weight records.
- Support one morning and one evening weight entry per date.
- Allow missing morning or evening entries.
- Add retrospective entries for any date.
- Add optional notes/tags for a weight record.
- Add weekly body measurements.
- Set a target weight.
- Automatically calculate the target date based on a loss rate of 0.5 kg/week.
- Show actual progress against the planned target line.
- Show smoothed morning-weight line.
- Show forecast line based on actual average progress.
- Show overview cards: current weight, target weight, estimated target date, current status.
- Show separate body measurement chart.
- Use local persistence.
- Include realistic seeded data.

### Out of scope for MVP

- Multi-user support.
- Required authentication.
- Cloud sync.
- Export to CSV, JSON, or PDF.
- Push notifications or reminders.
- Food tracking.
- Calorie tracking.
- Workout tracking.
- Complex statistical prediction.
- Motivational messages.
- Medical recommendations.

## 3. Platform and Persistence

### Platform

Build as a web application.

Preferred approach:

- local-first web app;
- responsive desktop-first layout;
- usable on mobile, but no need for native mobile patterns;
- no backend required for MVP.

### Persistence

Use local persistence.

Acceptable options:

- `localStorage` for a simple MVP;
- `IndexedDB` if the implementation already uses a structured local database;
- a local JSON-like data structure persisted in the browser.

The app should be structured so that server-side persistence or authentication can be added later without rewriting the product logic.

## 4. Language and Tone

UI language: English.

Tone:

- calm;
- analytical;
- concise;
- neutral;
- no motivational copy;
- no gamification;
- no exaggerated health language.

Avoid labels such as “failure” or “bad result”. Use neutral states such as:

- Ahead of plan
- On track
- Behind plan
- Not enough data

## 5. Data Model

### Weight entry

Each date can have only one weight record object.

```ts
type WeightEntry = {
  date: string; // YYYY-MM-DD
  morningWeightKg?: number | null;
  eveningWeightKg?: number | null;
  note?: string;
  tags?: WeightTag[];
  updatedAt: string;
};

type WeightTag =
  | "late_dinner"
  | "alcohol"
  | "training"
  | "illness"
  | "travel"
  | "other";
```

Rules:

- Morning and evening values are optional.
- Empty values must remain empty in the UI.
- Missing values should not be visually filled.
- The same date cannot have duplicate morning or evening entries.
- Editing an existing value replaces the previous value.
- Weight must be numeric.
- Use kilograms.
- No need for strict medical validation, but reject non-numeric values.

### Body measurement entry

Body measurements are usually entered weekly, but the app should allow any date.

```ts
type BodyMeasurementEntry = {
  date: string; // YYYY-MM-DD
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  note?: string;
  updatedAt: string;
};
```

Rules:

- Values are optional.
- Use centimeters.
- No additional measurement types in MVP.
- UI label for hips: `Hips`.

### Goal

```ts
type WeightGoal = {
  id: string;
  createdAt: string;
  startDate: string; // YYYY-MM-DD
  startWeightKg: number;
  targetWeightKg: number;
  weeklyLossKg: number; // default: 0.5
  calculatedTargetDate: string;
  status: "active" | "archived";
  revisionOfGoalId?: string | null;
};
```

Rules:

- User enters only the target weight.
- Weekly loss rate is fixed at `0.5 kg/week` for MVP.
- The app calculates the target date automatically.
- Start weight should be based on the latest available smoothed morning weight on the goal start date.
- If there is not enough data for smoothing, use the latest available morning weight.
- Goal changes should be stored as history, not overwritten.
- When the target is changed, archive the previous goal and create a new active goal.

## 6. Missing Data Logic

### Display logic

- Raw morning and evening entries should show gaps when missing.
- Do not visually invent missing measurements.
- The user must be able to see which days were not measured.

### Calculation logic

For derived calculations only:

- If a morning weight is missing, use the previous available morning weight as a carried-forward value.
- This carried-forward value is used only for smoothing, status, and forecast calculations.
- It must not be saved as an actual measurement.
- Internally mark such values as `imputed` or `carriedForward`.

Evening weight should not replace morning weight for the main progress calculation.

## 7. Weight Metrics and Calculations

### Primary weight signal

The primary signal is morning weight.

Use morning weight for:

- current weight overview;
- smoothed weight line;
- progress status;
- target comparison;
- forecast.

Evening weight is secondary and used mainly as an upper daily reference.

### Smoothed line

The main chart should include a smoothed morning-weight line.

Default smoothing method:

- 3-day moving average based on morning weight.

Optional toggle:

- 3-day moving average;
- 3-day median.

If the toggle is implemented, label it clearly:

- `Average`
- `Median`

### Planned target line

The planned target line starts at goal start weight and moves toward the target weight at `0.5 kg/week`.

Formula:

```txt
plannedWeight(date) = startWeightKg - daysSinceStart * (0.5 / 7)
```

Stop the planned line at the calculated target date.

### Forecast line

The forecast is a rough linear projection based on actual average progress.

Use:

```txt
actualLossRatePerDay = (startWeightKg - latestSmoothedWeightKg) / daysSinceGoalStart
forecastWeight(date) = latestSmoothedWeightKg - futureDays * actualLossRatePerDay
```

Rules:

- Show forecast only when there are enough data points.
- Minimum: 7 days of data after goal start.
- Use a dashed line for forecast.
- Forecast must be clearly visually distinct from real data.
- Do not use advanced prediction, seasonality, or spike detection.

### Progress status

Compare the latest smoothed morning weight against the planned target weight for the current date.

Suggested thresholds:

```txt
delta = latestSmoothedWeightKg - plannedWeightToday
```

- `Ahead of plan`: delta <= -0.3 kg
- `On track`: -0.3 kg < delta < 0.3 kg
- `Behind plan`: delta >= 0.3 kg
- `Not enough data`: fewer than 7 days of usable data

The exact threshold can be adjusted, but it should avoid overreacting to small fluctuations.

## 8. Weight Chart

### Main chart purpose

The chart should help the user understand:

- actual morning weight;
- evening upper variation;
- smoothed progress;
- planned target path;
- rough forecast;
- whether progress is ahead of or behind the plan.

### Required chart layers

Include these layers:

1. Raw morning weight points/line.
2. Raw evening weight points/line.
3. Smoothed morning-weight line — primary visual layer.
4. Planned target line.
5. Forecast line — dashed, future-only.
6. Optional daily range band between morning and evening weight.

### Daily range band

Show the band between morning and evening weight when both values exist.

Purpose:

- communicate daily fluctuation;
- show that evening weight is usually the upper bound;
- reduce overinterpretation of raw daily points.

Rules:

- The band should be visually secondary.
- The smoothed morning line should remain the most important chart element.
- If one of the values is missing, do not render the band for that day.

### Chart periods

Required range controls:

- 7D
- 30D
- Goal period
- 1Y

Default view:

- Goal period, if active goal exists.
- Otherwise 30D.

The goal period should show the full path from goal start date to calculated target date.

### Tooltips

Tooltip should show:

- date;
- morning weight;
- evening weight;
- smoothed value;
- planned value;
- delta vs plan;
- note/tags, if available.

Keep tooltip compact.

## 9. Body Measurements

### Measurements tracked

- Chest
- Waist
- Hips

### Entry frequency

Expected frequency: weekly.

The app should still allow arbitrary dates, because users may enter measurements retrospectively or irregularly.

### Measurements chart

Use a separate chart from the weight chart.

Chart should show:

- chest line;
- waist line;
- hips line.

Also show simple deltas:

- change since previous measurement;
- change since first measurement;
- optionally change over last 30 days if enough data exists.

Do not mix body measurements and weight into the same chart.

## 10. Main Screens

### 10.1 Dashboard

Purpose: overview of progress.

Required sections:

1. Overview cards.
2. Main weight chart.
3. Recent entries.
4. Body measurements chart.

Overview cards:

- Current smoothed weight.
- Target weight.
- Estimated target date.
- Status: Ahead of plan / On track / Behind plan / Not enough data.
- Delta vs planned weight.
- Actual average weekly pace.

### 10.2 Daily Entry

Purpose: fast daily input.

Fields:

- Date.
- Morning weight.
- Evening weight.
- Tags.
- Optional note.

Default date: today.

The screen should support both:

- today’s quick entry;
- retrospective editing by changing the date.

If data already exists for the selected date, show existing values and allow editing.

### 10.3 Body Measurements Entry

Fields:

- Date.
- Chest.
- Waist.
- Hips.
- Optional note.

Default date: today.

### 10.4 Goal Settings

Fields:

- Target weight.
- Start date.
- Start weight, auto-filled from latest available morning/smoothed weight but editable if needed.
- Weekly loss rate shown as fixed value: `0.5 kg/week`.

Show calculated target date before saving.

When editing an active goal:

- do not overwrite historical goal;
- create a new goal revision;
- archive previous active goal.

### 10.5 History / Data Table

A simple table for checking and editing raw records.

Weight table columns:

- Date
- Morning weight
- Evening weight
- Tags
- Note
- Actions

Body measurements table columns:

- Date
- Chest
- Waist
- Hips
- Note
- Actions

## 11. UI Direction

Style:

- calm;
- minimal;
- analytical;
- clear visual hierarchy;
- data-first;
- no decorative wellness clichés;
- no gamified progress effects.

Layout direction:

- desktop-first dashboard;
- card-based overview;
- large primary chart;
- compact forms;
- clear empty states.

Suggested navigation:

- Dashboard
- Add weight
- Measurements
- Goal
- History

## 12. Empty States and Edge Cases

### No data yet

Show:

- empty chart state;
- CTA to add first weight entry;
- no fake analytics.

### Not enough data

If fewer than 7 days of usable data:

- show raw entries;
- show smoothing if possible;
- status should be `Not enough data`;
- hide or soften forecast.

### Missing morning weight

- show a gap in raw morning line;
- use carried-forward value only for calculations;
- do not save the carried-forward value as a real record.

### Missing evening weight

- show no evening point for that date;
- no daily band for that date.

### Target already reached

If smoothed morning weight reaches or goes below target weight:

- show status: `Target reached`;
- keep historical chart visible;
- allow setting a new target.

## 13. Seed Data Requirements

Generate realistic test data.

Seed dataset should include:

- at least 90 days of weight data;
- morning and evening measurements;
- some missing morning/evening values;
- evening values generally higher than morning values;
- occasional spikes after tags such as late dinner or alcohol;
- gradual downward trend;
- body measurements approximately once per week;
- at least one active goal.

Example pattern:

- start weight around 70–75 kg;
- target weight around 60–65 kg;
- average decrease around 0.5 kg/week;
- daily fluctuations around ±0.3–0.8 kg;
- evening weight often +0.4–1.2 kg above morning weight.

## 14. Technical Expectations

The AI agent should produce:

- working frontend code;
- clean component structure;
- local persistence layer;
- deterministic calculation utilities;
- seeded test data;
- responsive layout;
- reusable chart components;
- clear naming;
- no unnecessary backend complexity.

Suggested stack, unless another stack is already selected:

- React;
- TypeScript;
- Vite or Next.js;
- Recharts or similar charting library;
- localStorage or IndexedDB for persistence.

Calculation logic should be separated from UI components.

Recommended structure:

```txt
/src
  /components
  /charts
  /forms
  /data
  /utils
    calculations.ts
    smoothing.ts
    goals.ts
  /types
  /seed
```

## 15. Acceptance Criteria

The implementation is acceptable if:

- the user can add and edit morning/evening weight for any date;
- missing values remain empty visually;
- duplicate records for the same date are not created;
- the main chart shows morning, evening, smoothed, planned, and forecast lines;
- smoothing is based primarily on morning weight;
- goal date is calculated from target weight and `0.5 kg/week` loss rate;
- progress status is calculated from smoothed morning weight vs planned weight;
- body measurements are entered and shown on a separate chart;
- goal edits are stored historically;
- local data persists after page reload;
- seeded data demonstrates realistic fluctuations and missing entries;
- the UI is in English;
- the app remains compact and avoids unnecessary wellness/productivity features.

## 16. Short Prompt for the AI Agent

Build a personal local-first web app for tracking weight and body measurements. It should support daily morning/evening weight entries, retrospective editing, optional notes/tags, a target weight with an automatically calculated target date based on 0.5 kg/week, smoothed morning-weight trend, planned target line, rough forecast line, and a separate weekly body measurements chart for chest, waist, and hips. Use English UI, calm minimal dashboard style, local persistence, realistic seed data, and working frontend code. Follow the detailed specification above.

