export {
	DEFAULT_WEEKLY_LOSS_KG,
	MIN_FORECAST_DAYS,
	STATUS_LABELS,
	STATUS_THRESHOLD_KG,
	TAG_LABELS,
	addDays,
	buildDailyWeightMetrics,
	calculateTargetDate,
	daysBetween,
	deriveWeightDashboard,
	formatNumber,
	getForecastEndpoint,
	isIsoDate,
	plannedWeight,
	prettyDate,
	todayIso
} from './weight-tracking.utils';

export { WEIGHT_TAGS } from './weight-tracking.types';
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
	WeightGoal,
	WeightGoalFormValues,
	WeightGoalStatus,
	WeightTag,
	WeightTrackingActionData,
	WeightTrackingData
} from './weight-tracking.types';
