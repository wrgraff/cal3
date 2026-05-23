export { default as BodyMeasurementPage } from './BodyMeasurementPage.svelte';
export { default as GoalRevisionPage } from './GoalRevisionPage.svelte';
export { default as WeightEntryPage } from './WeightEntryPage.svelte';
export { default as WeightFormPage } from './WeightFormPage.svelte';
export { default as WeightHistoryPage } from './WeightHistoryPage.svelte';

export {
	DEFAULT_WEEKLY_LOSS_KG,
	MIN_FORECAST_DAYS,
	STATUS_LABELS,
	STATUS_THRESHOLD_KG,
	TAG_LABELS,
	addDays,
	buildDailyWeightMetrics,
	calculateTargetDate,
	deriveWeightDashboard,
	formatNumber,
	getForecastEndpoint,
	isIsoDate,
	plannedWeight,
	prettyDate,
	todayIso
} from './weight-form.utils';

export { WEIGHT_TAGS } from './weight-form.types';
export type {
	BodyMeasurement,
	BodyMeasurementFormValues,
	ChartRange,
	DailyWeightMetric,
	MeasurementDelta,
	MeasurementSummary,
	ProgressStatus,
	SmoothingMethod,
	WeightDashboard,
	WeightDashboardSummary,
	WeightEntry,
	WeightEntryFormValues,
	WeightFormActionData,
	WeightFormData,
	WeightGoal,
	WeightGoalFormValues,
	WeightGoalStatus,
	WeightTag
} from './weight-form.types';
