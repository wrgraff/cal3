import type {
	BodyMeasurement,
	DailyWeightMetric,
	MeasurementDelta,
	MeasurementSummary,
	ProgressStatus,
	SmoothingMethod,
	WeightDashboard,
	WeightDashboardSummary,
	WeightEntry,
	WeightGoal,
	WeightTag
} from './weight-tracking.types';

export const DEFAULT_WEEKLY_LOSS_KG = 0.5;
export const MIN_FORECAST_DAYS = 7;
export const STATUS_THRESHOLD_KG = 0.3;

export const TAG_LABELS: Record<WeightTag, string> = {
	late_dinner: 'Late dinner',
	alcohol: 'Alcohol',
	training: 'Training',
	illness: 'Illness',
	travel: 'Travel',
	other: 'Other'
};

export const STATUS_LABELS: Record<ProgressStatus, string> = {
	ahead: 'Ahead of plan',
	on_track: 'On track',
	behind: 'Behind plan',
	not_enough_data: 'Not enough data',
	reached: 'Target reached'
};

export function todayIso(date = new Date()): string {
	return formatDate(date);
}

export function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function parseDate(value: string): Date {
	const [year, month, day] = value.split('-').map(Number);
	return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

export function addDays(value: string, days: number): string {
	const date = parseDate(value);
	date.setDate(date.getDate() + days);
	return formatDate(date);
}

export function daysBetween(startDate: string, endDate: string): number {
	const start = parseDate(startDate).getTime();
	const end = parseDate(endDate).getTime();
	return Math.round((end - start) / 86_400_000);
}

export function prettyDate(value: string | null, includeYear = false): string {
	if (!value) return '—';
	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: includeYear ? 'numeric' : undefined
	}).format(parseDate(value));
}

export function formatNumber(value: number | null | undefined, digits = 1): string {
	return value == null || Number.isNaN(value) ? '—' : value.toFixed(digits);
}

export function calculateTargetDate(
	goal: Pick<WeightGoal, 'startDate' | 'startWeightKg' | 'targetWeightKg' | 'weeklyLossKg'>
): string {
	const totalLoss = goal.startWeightKg - goal.targetWeightKg;
	const days = Math.ceil(totalLoss / (goal.weeklyLossKg / 7));
	return addDays(goal.startDate, Math.max(0, days));
}

export function plannedWeight(goal: WeightGoal, date: string): number | null {
	if (date < goal.startDate || date > goal.calculatedTargetDate) {
		return null;
	}

	const days = daysBetween(goal.startDate, date);
	return goal.startWeightKg - days * (goal.weeklyLossKg / 7);
}

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function smoothAt(
	values: Array<number | null>,
	index: number,
	method: SmoothingMethod
): number | null {
	const window = values.slice(Math.max(0, index - 2), index + 1).filter((value) => value != null);
	if (window.length === 0) return null;

	if (method === 'median') {
		return median(window);
	}

	return window.reduce((sum, value) => sum + value, 0) / window.length;
}

function deriveStatus(input: {
	smoothed: number | null;
	planned: number | null;
	daysOfData: number;
	targetReached: boolean;
}): ProgressStatus {
	if (input.targetReached) return 'reached';
	if (input.daysOfData < MIN_FORECAST_DAYS || input.smoothed == null || input.planned == null) {
		return 'not_enough_data';
	}

	const delta = input.smoothed - input.planned;
	if (delta <= -STATUS_THRESHOLD_KG) return 'ahead';
	if (delta >= STATUS_THRESHOLD_KG) return 'behind';
	return 'on_track';
}

export function buildDailyWeightMetrics(input: {
	entries: WeightEntry[];
	activeGoal: WeightGoal | null;
	currentDate?: string;
}): DailyWeightMetric[] {
	const { entries, activeGoal } = input;
	const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
	const firstEntryDate = sortedEntries[0]?.date;
	const latestEntryDate = sortedEntries.at(-1)?.date;
	const currentDate = input.currentDate ?? todayIso();
	const startDate = activeGoal?.startDate ?? firstEntryDate ?? currentDate;
	const endDate =
		[currentDate, latestEntryDate, activeGoal?.calculatedTargetDate]
			.filter((date): date is string => Boolean(date))
			.sort()
			.at(-1) ?? currentDate;

	const byDate = new Map(sortedEntries.map((entry) => [entry.date, entry]));
	const rowCount = Math.max(0, daysBetween(startDate, endDate)) + 1;
	let lastMorningWeight: number | null = null;
	const baseRows: Array<
		Omit<
			DailyWeightMetric,
			'smoothedAverageKg' | 'smoothedMedianKg' | 'progressStatus' | 'deltaVsPlanKg'
		>
	> = [];

	for (let index = 0; index < rowCount; index += 1) {
		const date = addDays(startDate, index);
		const entry = byDate.get(date);
		const morningWeight = entry?.morningWeightKg ?? null;
		if (morningWeight != null) {
			lastMorningWeight = morningWeight;
		}
		const carriedForward = morningWeight ?? lastMorningWeight;
		const planned = activeGoal ? plannedWeight(activeGoal, date) : null;

		baseRows.push({
			date,
			weightEntryId: entry?.id ?? null,
			activeGoalId: activeGoal?.id ?? null,
			morningWeightKg: morningWeight,
			eveningWeightKg: entry?.eveningWeightKg ?? null,
			carriedForwardMorningWeightKg: carriedForward,
			morningWeightImputed: morningWeight == null && carriedForward != null,
			plannedWeightKg: planned,
			tags: entry?.tags ?? []
		});
	}

	const filledValues = baseRows.map((row) => row.carriedForwardMorningWeightKg);
	const daysOfData = sortedEntries.filter((entry) => entry.morningWeightKg != null).length;

	return baseRows.map((row, index) => {
		const smoothedAverageKg = smoothAt(filledValues, index, 'average');
		const smoothedMedianKg = smoothAt(filledValues, index, 'median');
		const selectedSmoothed = smoothedAverageKg;
		const deltaVsPlanKg =
			selectedSmoothed != null && row.plannedWeightKg != null
				? selectedSmoothed - row.plannedWeightKg
				: null;
		const targetReached =
			activeGoal != null &&
			selectedSmoothed != null &&
			selectedSmoothed <= activeGoal.targetWeightKg;

		return {
			...row,
			smoothedAverageKg,
			smoothedMedianKg,
			deltaVsPlanKg,
			progressStatus: deriveStatus({
				smoothed: selectedSmoothed,
				planned: row.plannedWeightKg,
				daysOfData,
				targetReached
			})
		};
	});
}

export function getForecastEndpoint(input: {
	metrics: DailyWeightMetric[];
	goal: WeightGoal | null;
	currentDate: string;
}): { fromDate: string; fromWeightKg: number; toDate: string; toWeightKg: number } | null {
	const { metrics, goal, currentDate } = input;
	if (!goal) return null;

	const measuredDays = metrics.filter((metric) => metric.morningWeightKg != null).length;
	const latest = [...metrics]
		.reverse()
		.find((metric) => metric.date <= currentDate && metric.smoothedAverageKg != null);

	if (!latest?.smoothedAverageKg || measuredDays < MIN_FORECAST_DAYS) return null;

	const daysSinceStart = daysBetween(goal.startDate, currentDate);
	if (daysSinceStart <= 0) return null;

	const lossRatePerDay = (goal.startWeightKg - latest.smoothedAverageKg) / daysSinceStart;
	const futureDays = daysBetween(currentDate, goal.calculatedTargetDate);
	if (futureDays <= 0) return null;

	return {
		fromDate: currentDate,
		fromWeightKg: latest.smoothedAverageKg,
		toDate: goal.calculatedTargetDate,
		toWeightKg: latest.smoothedAverageKg - futureDays * lossRatePerDay
	};
}

function summarizeMeasurements(measurements: BodyMeasurement[]): MeasurementSummary {
	const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
	const latest = sorted.at(-1) ?? null;
	const previous = sorted.at(-2) ?? null;
	const first = sorted[0] ?? null;

	function delta(key: 'chestCm' | 'waistCm' | 'hipsCm'): MeasurementDelta {
		const current = latest?.[key] ?? null;
		return {
			current,
			previousDelta: current != null && previous?.[key] != null ? current - previous[key] : null,
			firstDelta: current != null && first?.[key] != null ? current - first[key] : null
		};
	}

	return {
		latest,
		chest: delta('chestCm'),
		waist: delta('waistCm'),
		hips: delta('hipsCm')
	};
}

function summarizeDashboard(input: {
	metrics: DailyWeightMetric[];
	activeGoal: WeightGoal | null;
	currentDate: string;
}): WeightDashboardSummary {
	const { metrics, activeGoal, currentDate } = input;
	const visibleMetrics = metrics.filter((metric) => metric.date <= currentDate);
	const latestMetric = [...visibleMetrics]
		.reverse()
		.find((metric) => metric.smoothedAverageKg != null);
	const latestMorning = [...visibleMetrics]
		.reverse()
		.find((metric) => metric.morningWeightKg != null);
	const daysOfData = visibleMetrics.filter((metric) => metric.morningWeightKg != null).length;
	const daysSinceStart = activeGoal
		? Math.max(0, daysBetween(activeGoal.startDate, currentDate))
		: null;
	const currentWeightKg = latestMetric?.smoothedAverageKg ?? null;
	const plannedNow = activeGoal ? plannedWeight(activeGoal, currentDate) : null;
	const deltaVsPlanKg =
		currentWeightKg != null && plannedNow != null ? currentWeightKg - plannedNow : null;
	const targetReached =
		activeGoal != null && currentWeightKg != null && currentWeightKg <= activeGoal.targetWeightKg;
	const status = deriveStatus({
		smoothed: currentWeightKg,
		planned: plannedNow,
		daysOfData,
		targetReached
	});
	const actualPaceKgPerWeek =
		activeGoal && currentWeightKg != null && daysSinceStart && daysSinceStart > 0
			? ((activeGoal.startWeightKg - currentWeightKg) / daysSinceStart) * 7
			: null;

	return {
		currentWeightKg,
		latestMorningWeightKg: latestMorning?.morningWeightKg ?? null,
		targetWeightKg: activeGoal?.targetWeightKg ?? null,
		targetDate: activeGoal?.calculatedTargetDate ?? null,
		status,
		deltaVsPlanKg,
		actualPaceKgPerWeek,
		plannedPaceKgPerWeek: activeGoal ? activeGoal.weeklyLossKg : null,
		daysOfData,
		daysSinceStart
	};
}

export function deriveWeightDashboard(input: {
	entries: WeightEntry[];
	measurements: BodyMeasurement[];
	goals: WeightGoal[];
	currentDate?: string;
}): WeightDashboard {
	const currentDate = input.currentDate ?? todayIso();
	const activeGoal = input.goals.find((goal) => goal.status === 'active') ?? null;
	const metrics = buildDailyWeightMetrics({
		entries: input.entries,
		activeGoal,
		currentDate
	});

	return {
		entries: [...input.entries].sort((a, b) => b.date.localeCompare(a.date)),
		measurements: [...input.measurements].sort((a, b) => b.date.localeCompare(a.date)),
		goals: [...input.goals].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
		activeGoal,
		metrics,
		summary: summarizeDashboard({ metrics, activeGoal, currentDate }),
		measurementSummary: summarizeMeasurements(input.measurements),
		currentDate
	};
}

export function coerceNullableNumber(value: FormDataEntryValue | null): number | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function isIsoDate(value: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(value) && formatDate(parseDate(value)) === value;
}
