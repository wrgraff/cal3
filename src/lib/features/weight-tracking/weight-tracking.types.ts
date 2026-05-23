export const WEIGHT_TAGS = [
	'late_dinner',
	'alcohol',
	'training',
	'illness',
	'travel',
	'other'
] as const;

export type WeightTag = (typeof WEIGHT_TAGS)[number];

export type WeightGoalStatus = 'active' | 'archived' | 'reached';
export type ProgressStatus = 'ahead' | 'on_track' | 'behind' | 'not_enough_data' | 'reached';
export type SmoothingMethod = 'average' | 'median';
export type ChartRange = '7d' | '30d' | 'goal' | '1y';

export interface WeightEntry {
	id: string;
	date: string;
	morningWeightKg: number | null;
	eveningWeightKg: number | null;
	tags: WeightTag[];
	createdAt: string;
	updatedAt: string;
}

export interface BodyMeasurement {
	id: string;
	date: string;
	chestCm: number | null;
	waistCm: number | null;
	hipsCm: number | null;
	createdAt: string;
	updatedAt: string;
}

export interface WeightGoal {
	id: string;
	startDate: string;
	startWeightKg: number;
	targetWeightKg: number;
	weeklyLossKg: number;
	calculatedTargetDate: string;
	status: WeightGoalStatus;
	revisionOfGoalId: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface DailyWeightMetric {
	date: string;
	weightEntryId: string | null;
	activeGoalId: string | null;
	morningWeightKg: number | null;
	eveningWeightKg: number | null;
	carriedForwardMorningWeightKg: number | null;
	morningWeightImputed: boolean;
	smoothedAverageKg: number | null;
	smoothedMedianKg: number | null;
	plannedWeightKg: number | null;
	deltaVsPlanKg: number | null;
	progressStatus: ProgressStatus;
	tags: WeightTag[];
}

export interface MeasurementDelta {
	current: number | null;
	previousDelta: number | null;
	firstDelta: number | null;
}

export interface MeasurementSummary {
	latest: BodyMeasurement | null;
	chest: MeasurementDelta;
	waist: MeasurementDelta;
	hips: MeasurementDelta;
}

export interface WeightDashboardSummary {
	currentWeightKg: number | null;
	latestMorningWeightKg: number | null;
	targetWeightKg: number | null;
	targetDate: string | null;
	status: ProgressStatus;
	deltaVsPlanKg: number | null;
	actualPaceKgPerWeek: number | null;
	plannedPaceKgPerWeek: number | null;
	daysOfData: number;
	daysSinceStart: number | null;
}

export interface WeightDashboard {
	entries: WeightEntry[];
	measurements: BodyMeasurement[];
	goals: WeightGoal[];
	activeGoal: WeightGoal | null;
	metrics: DailyWeightMetric[];
	summary: WeightDashboardSummary;
	measurementSummary: MeasurementSummary;
	currentDate: string;
}

export interface WeightTrackingData {
	entries: WeightEntry[];
	measurements: BodyMeasurement[];
	goals: WeightGoal[];
}

export interface WeightEntryFormValues {
	date: string;
	morningWeightKg: string;
	eveningWeightKg: string;
	tags: WeightTag[];
}

export interface BodyMeasurementFormValues {
	date: string;
	chestCm: string;
	waistCm: string;
	hipsCm: string;
}

export interface WeightGoalFormValues {
	startDate: string;
	startWeightKg: string;
	targetWeightKg: string;
}

export interface WeightTrackingFieldErrors {
	date?: string;
	morningWeightKg?: string;
	eveningWeightKg?: string;
	tags?: string;
	chestCm?: string;
	waistCm?: string;
	hipsCm?: string;
	startDate?: string;
	startWeightKg?: string;
	targetWeightKg?: string;
}

export interface WeightTrackingActionState<TValues> {
	values: TValues;
	fieldErrors?: WeightTrackingFieldErrors;
	formError?: string;
	message?: string;
}

export interface WeightTrackingActionData {
	weightEntry?: WeightTrackingActionState<WeightEntryFormValues>;
	bodyMeasurement?: WeightTrackingActionState<BodyMeasurementFormValues>;
	goal?: WeightTrackingActionState<WeightGoalFormValues>;
	message?: string;
}
