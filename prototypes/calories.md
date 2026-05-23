# Calorie Tracker Web App — AI Agent Specification

## 1. Product Goal

Create a compact personal web application for tracking calorie and macro intake with a faster, cleaner food logging flow than typical calorie trackers.

The product should be part of the same personal health tracking system as the weight tracker, or at least share the same data model and visual language.

The key product idea is not broad wellness coaching, meal plans, or AI estimation. The key idea is fast, reliable logging of food the user actually eats repeatedly.

Primary goals:

- track daily calorie intake;
- track protein, carbs, fat, and optionally fiber;
- compare calorie intake with smoothed weight trend;
- support custom meal slots;
- make repeated logging extremely fast;
- avoid bad default units and unreliable serving sizes;
- build a personal trusted food database over time;
- use external product databases only as a source for initial import.

## 2. Product Principles

### 2.1 Fast repeat logging

The user often eats the same products and similar meals.

The app should prioritize:

- favorites;
- frequent foods by meal slot;
- meal templates;
- copy from previous days;
- custom foods already saved in the personal database.

Search and barcode scanning are useful, but they should not be required for foods the user already logged before.

### 2.2 Grams-first input

The default input model should be simple:

- grams for solid food;
- milliliters for liquids;
- no arbitrary units from external databases by default;
- no default `1 serving` if it creates friction;
- user-defined default portions are allowed.

The app should not force the user to choose between strange units such as berries, bowls, portions, servings, cups, slices, or milliliters for solid foods.

### 2.3 Personal trusted database

External food databases are treated as import sources, not as the main source of truth.

When the user selects a product from an external database, the app should save it into the personal food database. From that point onward, the local product should be used first.

Each local product can be edited, verified, favorited, and reused.

### 2.4 Low-friction correction

Nutrition data can be wrong or incomplete.

The app should make correction easy:

- edit calories/macros per 100g or 100ml;
- mark product as verified by user;
- keep source metadata;
- warn when imported data looks suspicious;
- preserve historical diary integrity.

### 2.5 No motivational layer

Do not add:

- motivational messages;
- streak pressure;
- guilt-based warnings;
- gamified scoring;
- meal plans;
- generic wellness advice.

The tone should be calm, analytical, and direct.

## 3. Platform and Scope

### Platform

Build as a web application.

Preferred approach:

- local-first web app;
- responsive desktop-first layout;
- usable on mobile;
- PWA-ready structure is acceptable;
- no required backend in MVP.

### Persistence

Use local persistence for MVP.

Acceptable options:

- IndexedDB preferred for structured food/diary data;
- localStorage acceptable only for a very simple prototype;
- data layer should be abstracted so server persistence can be added later.

### Authentication

Not required for MVP.

### Export/import

Not required for MVP.

## 4. Relationship to Weight Tracker

The calorie tracker should be designed as a module that can live together with the weight tracker.

Shared health system modules:

- Weight Tracker;
- Body Measurements;
- Calorie Tracker;
- Nutrition Analytics.

Shared concepts:

- current smoothed morning weight;
- target weight;
- target date;
- planned weight-loss line;
- daily calorie target;
- calorie intake vs weight trend analytics.

The calorie tracker should be able to show:

- current weight;
- target weight;
- weight goal status;
- smoothed morning-weight trend;
- calorie intake trend;
- weekly calorie average;
- comparison between calorie intake and weight loss.

## 5. MVP Scope

### Included in MVP

- Daily food diary.
- Custom meal slots.
- Manual food logging.
- Personal food database.
- Favorites.
- Frequent foods by meal slot.
- Recent foods as secondary fallback.
- Meal templates.
- Copy meal from another day.
- Copy full day from another date.
- Custom foods.
- Barcode scanner if feasible in web environment.
- External food lookup via product database if feasible.
- Grams/ml-first amount input.
- Calories, protein, carbs, fat, fiber.
- Daily summary.
- Weekly average summary.
- Calories vs weight chart.
- Product contribution to weekly calories.
- Local persistence.
- Realistic seeded data.

### Excluded from MVP

- Recipes.
- AI meal photo recognition.
- Food photo calorie estimation.
- Meal plans.
- Exercise tracking.
- Burned calories.
- Net calories based on activity.
- Apple Health / Google Fit integration.
- Micronutrient tracking beyond optional fiber.
- Social features.
- Multi-user accounts.
- Cloud sync.
- Motivational coaching.

### Under consideration / optional

- Barcode scanner.
- External barcode/product lookup.
- Nutrition label scan from packaging.
- External sync.
- Micronutrients.

## 6. Nutrition Targets

### Daily calorie target

The app should calculate a suggested daily calorie target automatically, but allow manual override.

MVP approach:

- user can enter current estimated maintenance calories manually;
- app suggests a deficit based on target weight-loss pace;
- default weight-loss pace: aligned with weight tracker, `0.5 kg/week`;
- calorie target can be manually edited.

Suggested calculation:

```txt
weeklyDeficitKcal = 0.5 kg * 7700 kcal = 3850 kcal/week
dailyDeficitKcal = 3850 / 7 ≈ 550 kcal/day
suggestedDailyTarget = estimatedMaintenanceKcal - dailyDeficitKcal
```

This should be presented as an estimate, not a precise biological truth.

### Macro targets

Track targets for:

- protein;
- carbs;
- fat;
- optionally fiber.

MVP should allow manual targets.

Automatic macro target calculation is optional and can be basic.

### Weekly average

Weekly average is more important than single-day precision.

Show:

- daily calorie intake;
- 7-day average intake;
- daily target;
- weekly target average;
- difference between weekly average and target.

Do not include “calorie banking” mechanics.

The app should not encourage compensating tomorrow for overeating today.

## 7. Meal Model

### Custom meal slots

Use configurable meal slots instead of hardcoded Breakfast / Lunch / Dinner / Snacks only.

Default meal slots:

- Breakfast
- Lunch
- Dinner
- Snack 1
- Snack 2
- Snack 3

User should be able to:

- rename meal slots;
- reorder meal slots;
- hide unused meal slots;
- restore default slots.

Food entries belong to a meal slot.

### No required timestamps

Do not rely on actual eating time.

Reason:

- users often log food later;
- barcode scanning may happen after the meal;
- timestamp data would not be reliable.

The app can store `createdAt` and `updatedAt` for technical purposes, but product logic should use date + meal slot, not time.

## 8. Food Logging Flow

### Main diary screen

The main screen should be the daily food diary.

Top summary:

- calories eaten;
- calories left;
- protein;
- carbs;
- fat;
- fiber if available;
- weekly average context.

Then show meal slots.

Each meal slot should show:

- meal name;
- total kcal;
- macro summary;
- list of logged food items;
- add food action;
- copy meal action;
- save as template action.

### Add food screen

When adding food to a meal slot, show the most useful sources immediately.

Recommended layout:

1. Search field.
2. Favorites for this meal slot.
3. Frequent foods for this meal slot.
4. Meal templates relevant to this meal slot.
5. Recent foods as secondary fallback.
6. Search results from personal database.
7. Optional external search results.
8. Barcode scan action.
9. Create custom food action.

Do not force the user to search before seeing favorites/frequent foods.

### Favorites vs frequent

Use both concepts.

Favorites:

- manually saved by user;
- can include product image;
- can have default amount;
- can be meal-slot-specific or global.

Frequent foods:

- computed automatically from logging history;
- ranked by usage count and recency;
- should be specific to the selected meal slot.

Recent foods:

- shown, but not prioritized over favorites/frequent;
- useful as fallback only.

### Meal-slot-specific ranking

Frequent foods should depend on meal slot, not time of day.

Example:

- cottage cheese may rank high for Breakfast;
- the same product should not rank high for Lunch unless actually used there.

## 9. Amount Input UX

### Default units

Default unit rules:

- solids: grams;
- liquids: milliliters;
- custom unit allowed only if user defines gram/ml equivalent;
- imported arbitrary units should be ignored or hidden unless normalized.

Allowed MVP units:

- g;
- ml.

Optional custom unit:

```ts
type CustomUnit = {
  id: string;
  label: string;
  baseUnit: "g" | "ml";
  equivalentAmount: number;
};
```

Examples:

- `1 slice = 35 g`;
- `1 scoop = 30 g`;
- `1 cup = 200 ml`.

Custom units should be user-defined, not blindly imported from external databases.

### Amount field behavior

After selecting a food:

- amount field should be focused automatically;
- full current value should be selected;
- numeric keyboard should open on mobile;
- typing should replace the whole value;
- cursor should not be placed before/after a default `1` unexpectedly.

### Default amount

Amount should default to one of these, in priority order:

1. user-defined default amount for this product;
2. most frequently used amount for this product in this meal slot;
3. last used amount for this product;
4. empty or 100g fallback.

### Amount chips

Show quick amount chips based on the user’s history for this product.

Example:

If raisins are usually logged as 17g, 19g, or 20g, show chips:

- 17g
- 19g
- 20g

Do not rely only on generic chips such as 50g / 100g / 150g.

Generic chips can be fallback if no history exists.

### Increment controls

Add small controls for precise adjustment:

- `-1g`
- `+1g`

For larger values optional:

- `-5g`
- `+5g`

This is for correcting small weighing differences without retyping the number.

### Inline nutrition preview

When amount changes, show a live preview:

```txt
147 g → 184 kcal · 18.2g protein · 9.1g carbs · 6.3g fat
```

## 10. Food Database

### Personal food database

Primary database should be the user’s local food database.

```ts
type FoodProduct = {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  imageUrl?: string;
  source: "manual" | "external_import" | "barcode_import";
  sourceProvider?: "open_food_facts" | "other";
  sourceId?: string;
  verifiedByUser: boolean;
  favorite: boolean;
  preferredMealSlotIds?: string[];
  defaultAmount?: number;
  defaultUnit: "g" | "ml";
  nutritionPer100: NutritionPer100;
  customUnits?: CustomUnit[];
  createdAt: string;
  updatedAt: string;
};

type NutritionPer100 = {
  kcal: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
};
```

### External database behavior

External search/barcode lookup should be used only to create local food entries.

Flow:

1. Search or scan barcode.
2. Show matched external product.
3. User reviews kcal/macros per 100g or 100ml.
4. User imports product into personal database.
5. App uses local copy from now on.
6. User can edit and verify local copy.

### Data trust state

Products should have visible states:

- Imported
- Edited
- Verified by me

Imported products should be easy to correct.

### Suspicious data detection

Show a warning when imported data looks suspicious.

Examples:

- missing calories;
- calories above 900 kcal per 100g;
- protein + carbs + fat macros impossible or very inconsistent;
- no per-100g or per-100ml data;
- solid food with ml as default unit;
- liquid food with g as default unit;
- arbitrary serving sizes without gram/ml equivalent.

The warning should not block use, but should encourage review.

## 11. Barcode Scanner

Barcode scanning is desirable, especially for first-time product import.

### MVP implementation approach

Build barcode scanning as progressive enhancement.

Requirements:

- if browser barcode scanning is available, use it;
- if not available, allow manual barcode input;
- if external product lookup is not available, allow manual custom food creation;
- scanning should not be required for repeat logging.

### After successful scan

If one product is found:

- open product review/import screen.

If multiple products are found:

- show a small list with product name, brand, kcal per 100g/ml, and source.

If no product is found:

- show “Create custom food” with barcode prefilled.

### External source

Open Food Facts is a reasonable candidate for MVP because it supports barcode-based product lookup and provides nutrition data.

However, because the database is crowdsourced, imported data must be reviewed and stored locally.

## 12. Logged Food Entries

### Food log item

```ts
type FoodLogItem = {
  id: string;
  date: string; // YYYY-MM-DD
  mealSlotId: string;
  productId: string;
  productNameSnapshot: string;
  brandSnapshot?: string;
  amount: number;
  unit: "g" | "ml";
  nutritionPer100Snapshot: NutritionPer100;
  totalsSnapshot: NutritionTotals;
  productVersionUpdatedAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

type NutritionTotals = {
  kcal: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
};
```

### Historical integrity

When a product is edited later, historical log items should not silently change.

Instead:

- each log item keeps a nutrition snapshot;
- app can detect that product data has changed;
- affected entries can be marked as using outdated product data;
- user may optionally recalculate affected entries.

### Daily totals

Daily totals should be calculated from logged item snapshots.

Optional:

- store cached daily totals for performance;
- invalidate or flag cache when entries change.

If product data is updated after a day was logged, show a subtle warning if historical snapshots differ from current product data.

Do not silently rewrite past days.

## 13. Meal Templates

Meal templates are required in MVP.

They are more important than recipes.

Purpose:

- speed up repeated meals;
- allow flexible adjustment after insertion;
- support common breakfasts/lunches/snacks.

```ts
type MealTemplate = {
  id: string;
  name: string;
  mealSlotId?: string;
  imageUrl?: string;
  items: MealTemplateItem[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
};

type MealTemplateItem = {
  productId: string;
  amount: number;
  unit: "g" | "ml";
};
```

Template behavior:

- user can create a template from an existing meal slot;
- user can insert a template into today or another date;
- inserted items become normal editable log items;
- template is not a rigid recipe;
- user can adjust grams after insertion.

## 14. Copy and Reuse

### Copy meal

User can copy a meal from:

- today to another day;
- another day to today;
- any selected date to any other selected date.

### Copy day

User can load/copy a full day from another date.

Flow:

1. Open daily diary.
2. Choose “Copy from another day”.
3. Select source date from recent days or date picker.
4. Preview meals/items.
5. Choose whether to replace current day or append to current day.

Recommended options:

- `Append missing meals`
- `Replace current day`
- `Choose meals manually`

### Duplicate product entry

User can duplicate an item within the same meal or move/copy it to another meal slot/date.

## 15. Dashboard and Analytics

### Main screen: Daily Diary

Main screen should prioritize today’s food log.

Header:

- selected date;
- previous/next day controls;
- calories eaten;
- calories left;
- weekly average indicator.

Daily summary:

- kcal eaten;
- kcal target;
- kcal left;
- protein total / target;
- carbs total / target;
- fat total / target;
- fiber total if available.

Meal slot list:

- each slot shows item list and meal total.

### Weekly stats

Required:

- calorie intake by day;
- 7-day average line;
- daily target line;
- protein average;
- calorie difference vs target.

### Calories vs weight chart

Required chart:

- daily calorie intake;
- 7-day average calorie intake;
- smoothed morning weight from weight tracker;
- optional planned weight target line.

Purpose:

- help understand whether calorie intake and weight trend roughly align;
- avoid overinterpreting one day.

Do not infer complex causality.

### Product contribution chart

Show contribution of products to weekly calorie intake.

Example:

- top 10 products by kcal over selected week;
- percent of weekly calories;
- kcal total;
- number of times logged.

This should be an analytics view, not always visible on the main diary screen.

## 16. Screens

### 16.1 Daily Diary

Core screen.

Contains:

- date switcher;
- summary cards;
- meal slots;
- add food actions;
- copy day action;
- weekly average context.

### 16.2 Add Food

Opened in context of date + meal slot.

Contains:

- search input;
- favorites for meal slot;
- frequent foods for meal slot;
- templates for meal slot;
- recent foods;
- personal database results;
- external database results if enabled;
- barcode scanner/manual barcode input;
- create custom food action.

### 16.3 Product Review / Amount Input

Used after selecting product.

Contains:

- product name;
- brand;
- image if available;
- verification status;
- kcal/macros per 100g/ml;
- amount field;
- unit selector limited to g/ml unless custom unit exists;
- amount history chips;
- +/- adjustment;
- live nutrition preview;
- add to meal action;
- edit product action;
- mark as favorite action.

### 16.4 Product Editor

Contains:

- name;
- brand;
- barcode;
- image;
- default unit;
- default amount;
- calories per 100g/ml;
- protein/carbs/fat/fiber per 100g/ml;
- favorite toggle;
- preferred meal slots;
- verification toggle.

### 16.5 Meal Templates

Contains:

- list of templates;
- create template from existing meal;
- edit template;
- duplicate template;
- delete template;
- insert template into selected day/meal.

### 16.6 Analytics

Contains:

- weekly calories chart;
- calories vs weight chart;
- product contribution chart;
- macro averages.

### 16.7 Settings

Contains:

- calorie target;
- macro targets;
- estimated maintenance calories;
- meal slot configuration;
- default units;
- data source settings;
- barcode scanner availability/status.

## 17. Data Model Summary

```ts
type MealSlot = {
  id: string;
  name: string;
  order: number;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
};

type NutritionTarget = {
  dailyKcal: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  estimatedMaintenanceKcal?: number;
  manuallyOverridden: boolean;
  updatedAt: string;
};
```

Main entities:

- `FoodProduct`
- `FoodLogItem`
- `MealSlot`
- `MealTemplate`
- `NutritionTarget`
- shared `WeightEntry` from weight tracker
- shared `WeightGoal` from weight tracker

## 18. Seed Data Requirements

Generate realistic seed data.

Seed data should include:

- 30–60 days of food logs;
- several configurable meal slots;
- repeated breakfast patterns;
- repeated snacks;
- several meal templates;
- custom foods;
- imported-looking foods;
- verified and unverified products;
- some products with images;
- realistic gram amounts;
- repeated amount history per product;
- daily calorie intake around target with normal variance;
- several days above target;
- several days below target;
- macro distribution;
- linked weight trend data if weight tracker module is present.

Example foods:

- cottage cheese;
- eggs;
- bread;
- oats;
- banana;
- raisins;
- chicken breast;
- rice;
- yogurt;
- milk;
- cheese;
- grapes;
- protein bar;
- coffee with milk.

## 19. UI Direction

Style:

- calm;
- compact;
- data-first;
- minimal;
- clear hierarchy;
- fast interaction;
- low friction;
- no wellness clichés.

The app should feel closer to a precise personal logging tool than to a lifestyle coaching app.

UI language: English.

Suggested navigation:

- Diary
- Foods
- Templates
- Analytics
- Weight
- Settings

## 20. Technical Expectations

The AI agent should produce a working frontend app.

Suggested stack:

- React;
- TypeScript;
- Vite or Next.js;
- IndexedDB/local persistence;
- Recharts or similar charting library;
- optional barcode scanner integration;
- optional Open Food Facts integration.

Architecture requirements:

- separate calculation logic from UI;
- separate persistence layer from components;
- deterministic calculations;
- typed data models;
- reusable chart components;
- realistic seed data;
- responsive layout;
- mobile-friendly amount input.

Suggested structure:

```txt
/src
  /components
  /charts
  /forms
  /data
  /features
    /diary
    /foods
    /templates
    /analytics
    /weight
  /utils
    nutrition.ts
    targets.ts
    ranking.ts
    history.ts
    barcode.ts
  /types
  /seed
```

## 21. Acceptance Criteria

The implementation is acceptable if:

- user can log food for any date;
- user can use custom meal slots;
- user can add foods from favorites/frequent lists without search;
- frequent foods are ranked by selected meal slot;
- grams/ml are default and arbitrary external units are not forced;
- amount input focuses correctly and selects the whole value;
- mobile numeric keyboard is used for amount input;
- user can adjust amount with +/- controls;
- amount chips are based on previous amounts for the same product;
- user can create and edit custom foods;
- imported foods are saved into personal database;
- products can be marked as verified by user;
- historical logged entries keep nutrition snapshots;
- product edits do not silently mutate past diary entries;
- user can copy meals and full days from another date;
- user can create and insert meal templates;
- daily summary shows calories and macros;
- weekly stats show 7-day calorie average;
- analytics include calories vs weight trend;
- product contribution chart shows top calorie sources for a week;
- local data persists after reload;
- app uses English UI;
- app avoids recipes, meal plans, AI meal recognition, and exercise tracking in MVP.

## 22. Short Prompt for the AI Agent

Build a local-first web app for personal calorie and macro tracking. It should work as part of a broader weight-tracking system, with English UI and a calm data-first style. The main screen is a daily food diary with custom meal slots, calories/macros summary, weekly average context, fast add flow, favorites, frequent foods by meal slot, meal templates, custom foods, grams/ml-first amount input, amount history chips, +/- gram controls, and local persistence. External food/barcode lookup is optional but imported products must be saved into the user’s personal database and editable/verified there. Include analytics for daily/weekly calories, calories vs smoothed weight trend, and top product contribution to weekly calories. Do not implement recipes, meal plans, AI meal photo recognition, exercise tracking, or calorie banking in MVP.

