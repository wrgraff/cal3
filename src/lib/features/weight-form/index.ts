export { default as WeightFormPage } from './WeightFormPage.svelte';

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
