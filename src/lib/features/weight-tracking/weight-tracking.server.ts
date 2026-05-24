import { fail } from '@sveltejs/kit';
import { type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '$lib/types/database.types';
import type {
	BodyMeasurement,
	BodyMeasurementFormValues,
	WeightEntry,
	WeightEntryFormValues,
	WeightTrackingActionData,
	WeightTrackingData,
	WeightGoal,
	WeightGoalFormValues,
	WeightTag
} from './weight-tracking.types';
import { WEIGHT_TAGS } from './weight-tracking.types';
import { coerceNullableNumber, isIsoDate } from './weight-tracking.utils';

interface WeightTrackingServerContext {
	supabase: App.Locals['supabase'];
	userId: string;
}

type WeightTrackingReadContext = Pick<WeightTrackingServerContext, 'supabase'>;

function typedSupabase(supabase: App.Locals['supabase']): SupabaseClient<Database> {
	return supabase as unknown as SupabaseClient<Database>;
}

type WeightEntryRow = {
	id: string;
	date: string;
	morning_weight_kg: number | string | null;
	evening_weight_kg: number | string | null;
	created_at: string;
	updated_at: string;
};

type WeightEntryTagRow = {
	weight_entry_id: string;
	tag: WeightTag;
};

type BodyMeasurementRow = {
	id: string;
	date: string;
	chest_cm: number | string | null;
	waist_cm: number | string | null;
	hips_cm: number | string | null;
	created_at: string;
	updated_at: string;
};

type WeightGoalRow = {
	id: string;
	start_date: string;
	start_weight_kg: number | string;
	target_weight_kg: number | string;
	weekly_loss_kg: number | string;
	calculated_target_date: string;
	status: 'active' | 'archived' | 'reached';
	revision_of_goal_id: string | null;
	created_at: string;
	updated_at: string;
};

function toNumber(value: number | string | null): number | null {
	if (value == null) return null;
	return Number(value);
}

function getString(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === 'string' ? value : '';
}

function mapEntry(row: WeightEntryRow, tags: WeightTag[]): WeightEntry {
	return {
		id: row.id,
		date: row.date,
		morningWeightKg: toNumber(row.morning_weight_kg),
		eveningWeightKg: toNumber(row.evening_weight_kg),
		tags,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

function mapMeasurement(row: BodyMeasurementRow): BodyMeasurement {
	return {
		id: row.id,
		date: row.date,
		chestCm: toNumber(row.chest_cm),
		waistCm: toNumber(row.waist_cm),
		hipsCm: toNumber(row.hips_cm),
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

function mapGoal(row: WeightGoalRow): WeightGoal {
	return {
		id: row.id,
		startDate: row.start_date,
		startWeightKg: Number(row.start_weight_kg),
		targetWeightKg: Number(row.target_weight_kg),
		weeklyLossKg: Number(row.weekly_loss_kg),
		calculatedTargetDate: row.calculated_target_date,
		status: row.status,
		revisionOfGoalId: row.revision_of_goal_id,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

function mapEntriesWithTags(
	entries: WeightEntryRow[] | null,
	tags: WeightEntryTagRow[] | null
): WeightEntry[] {
	const tagsByEntry = new Map<string, WeightTag[]>();
	for (const tagRow of tags ?? []) {
		const existing = tagsByEntry.get(tagRow.weight_entry_id) ?? [];
		existing.push(tagRow.tag);
		tagsByEntry.set(tagRow.weight_entry_id, existing);
	}

	return (entries ?? []).map((row) => mapEntry(row, tagsByEntry.get(row.id) ?? []));
}

async function loadWeightEntries(context: WeightTrackingReadContext): Promise<WeightEntry[]> {
	const supabase = typedSupabase(context.supabase);
	const [entriesResult, tagsResult] = await Promise.all([
		supabase
			.from('weight_entries')
			.select('id,date,morning_weight_kg,evening_weight_kg,created_at,updated_at')
			.order('date', { ascending: true }),
		supabase.from('weight_entry_tags').select('weight_entry_id,tag')
	]);

	if (entriesResult.error) throw entriesResult.error;
	if (tagsResult.error) throw tagsResult.error;

	return mapEntriesWithTags(
		(entriesResult.data ?? []) as WeightEntryRow[],
		(tagsResult.data ?? []) as WeightEntryTagRow[]
	);
}

async function loadBodyMeasurements(
	context: WeightTrackingReadContext
): Promise<BodyMeasurement[]> {
	const supabase = typedSupabase(context.supabase);
	const measurementsResult = await supabase
		.from('body_measurements')
		.select('id,date,chest_cm,waist_cm,hips_cm,created_at,updated_at')
		.order('date', { ascending: true });

	if (measurementsResult.error) throw measurementsResult.error;

	return ((measurementsResult.data ?? []) as BodyMeasurementRow[]).map(mapMeasurement);
}

async function loadWeightGoals(context: WeightTrackingReadContext): Promise<WeightGoal[]> {
	const supabase = typedSupabase(context.supabase);
	const goalsResult = await supabase
		.from('weight_goals')
		.select(
			'id,start_date,start_weight_kg,target_weight_kg,weekly_loss_kg,calculated_target_date,status,revision_of_goal_id,created_at,updated_at'
		)
		.order('created_at', { ascending: false });

	if (goalsResult.error) throw goalsResult.error;

	return ((goalsResult.data ?? []) as WeightGoalRow[]).map(mapGoal);
}

export async function loadWeightTrackingData(
	context: WeightTrackingReadContext
): Promise<WeightTrackingData> {
	const [entries, measurements, goals] = await Promise.all([
		loadWeightEntries(context),
		loadBodyMeasurements(context),
		loadWeightGoals(context)
	]);

	return {
		entries,
		measurements,
		goals
	};
}

export async function loadWeightEntryData(
	context: WeightTrackingReadContext
): Promise<WeightTrackingData> {
	return {
		entries: await loadWeightEntries(context),
		measurements: [],
		goals: []
	};
}

export async function loadBodyMeasurementData(
	context: WeightTrackingReadContext
): Promise<WeightTrackingData> {
	return {
		entries: [],
		measurements: await loadBodyMeasurements(context),
		goals: []
	};
}

export async function loadWeightGoalData(
	context: WeightTrackingReadContext
): Promise<WeightTrackingData> {
	const [entries, goals] = await Promise.all([
		loadWeightEntries(context),
		loadWeightGoals(context)
	]);

	return {
		entries,
		measurements: [],
		goals
	};
}

function parseWeightEntryForm(formData: FormData): WeightEntryFormValues {
	return {
		date: getString(formData, 'date'),
		morningWeightKg: getString(formData, 'morningWeightKg'),
		eveningWeightKg: getString(formData, 'eveningWeightKg'),
		tags: formData
			.getAll('tags')
			.filter(
				(value): value is WeightTag =>
					typeof value === 'string' && WEIGHT_TAGS.includes(value as WeightTag)
			)
	};
}

function parseBodyMeasurementForm(formData: FormData): BodyMeasurementFormValues {
	return {
		date: getString(formData, 'date'),
		chestCm: getString(formData, 'chestCm'),
		waistCm: getString(formData, 'waistCm'),
		hipsCm: getString(formData, 'hipsCm')
	};
}

function parseGoalForm(formData: FormData): WeightGoalFormValues {
	return {
		startDate: getString(formData, 'startDate'),
		startWeightKg: getString(formData, 'startWeightKg'),
		targetWeightKg: getString(formData, 'targetWeightKg')
	};
}

export async function upsertWeightEntry(context: WeightTrackingServerContext, formData: FormData) {
	const supabase = typedSupabase(context.supabase);
	const values = parseWeightEntryForm(formData);
	const morningWeightKg = coerceNullableNumber(values.morningWeightKg);
	const eveningWeightKg = coerceNullableNumber(values.eveningWeightKg);
	const fieldErrors: NonNullable<WeightTrackingActionData['weightEntry']>['fieldErrors'] = {};

	if (!isIsoDate(values.date)) fieldErrors.date = 'Choose a valid date.';
	if (Number.isNaN(morningWeightKg))
		fieldErrors.morningWeightKg = 'Morning weight must be a number.';
	if (Number.isNaN(eveningWeightKg))
		fieldErrors.eveningWeightKg = 'Evening weight must be a number.';
	if (morningWeightKg != null && !Number.isNaN(morningWeightKg) && morningWeightKg <= 0) {
		fieldErrors.morningWeightKg = 'Morning weight must be greater than zero.';
	}
	if (eveningWeightKg != null && !Number.isNaN(eveningWeightKg) && eveningWeightKg <= 0) {
		fieldErrors.eveningWeightKg = 'Evening weight must be greater than zero.';
	}
	if (morningWeightKg == null && eveningWeightKg == null) {
		fieldErrors.morningWeightKg = 'Add at least one weight value.';
	}

	if (Object.keys(fieldErrors).length > 0) {
		return fail(400, { weightEntry: { values, fieldErrors } });
	}

	const { error } = await supabase.rpc('upsert_weight_entry_with_tags', {
		p_date: values.date,
		p_morning_weight_kg: morningWeightKg ?? undefined,
		p_evening_weight_kg: eveningWeightKg ?? undefined,
		p_tags: values.tags
	});

	if (error) {
		return fail(500, { weightEntry: { values, formError: 'Could not save weight entry.' } });
	}

	return { message: 'Weight entry saved.' };
}

export async function deleteWeightEntry(context: WeightTrackingServerContext, formData: FormData) {
	const supabase = typedSupabase(context.supabase);
	const id = getString(formData, 'id');
	if (!id) {
		return fail(400, { message: 'Missing weight entry id.' });
	}

	const { error } = await supabase
		.from('weight_entries')
		.delete()
		.eq('id', id)
		.eq('user_id', context.userId);

	if (error) {
		return fail(500, { message: 'Could not delete weight entry.' });
	}

	return { message: 'Weight entry deleted.' };
}

export async function upsertBodyMeasurement(
	context: WeightTrackingServerContext,
	formData: FormData
) {
	const supabase = typedSupabase(context.supabase);
	const values = parseBodyMeasurementForm(formData);
	const chestCm = coerceNullableNumber(values.chestCm);
	const waistCm = coerceNullableNumber(values.waistCm);
	const hipsCm = coerceNullableNumber(values.hipsCm);
	const fieldErrors: NonNullable<WeightTrackingActionData['bodyMeasurement']>['fieldErrors'] = {};

	if (!isIsoDate(values.date)) fieldErrors.date = 'Choose a valid date.';
	if (Number.isNaN(chestCm)) fieldErrors.chestCm = 'Chest must be a number.';
	if (Number.isNaN(waistCm)) fieldErrors.waistCm = 'Waist must be a number.';
	if (Number.isNaN(hipsCm)) fieldErrors.hipsCm = 'Hips must be a number.';
	if (chestCm == null && waistCm == null && hipsCm == null) {
		fieldErrors.chestCm = 'Add at least one measurement.';
	}

	if (Object.keys(fieldErrors).length > 0) {
		return fail(400, { bodyMeasurement: { values, fieldErrors } });
	}

	const { error } = await supabase.from('body_measurements').upsert(
		{
			user_id: context.userId,
			date: values.date,
			chest_cm: chestCm,
			waist_cm: waistCm,
			hips_cm: hipsCm
		},
		{ onConflict: 'user_id,date' }
	);

	if (error) {
		return fail(500, {
			bodyMeasurement: { values, formError: 'Could not save body measurement.' }
		});
	}

	return { message: 'Body measurement saved.' };
}

export async function deleteBodyMeasurement(
	context: WeightTrackingServerContext,
	formData: FormData
) {
	const supabase = typedSupabase(context.supabase);
	const id = getString(formData, 'id');
	if (!id) {
		return fail(400, { message: 'Missing body measurement id.' });
	}

	const { error } = await supabase
		.from('body_measurements')
		.delete()
		.eq('id', id)
		.eq('user_id', context.userId);

	if (error) {
		return fail(500, { message: 'Could not delete body measurement.' });
	}

	return { message: 'Body measurement deleted.' };
}

export async function createGoalRevision(context: WeightTrackingServerContext, formData: FormData) {
	const supabase = typedSupabase(context.supabase);
	const values = parseGoalForm(formData);
	const startWeightKg = coerceNullableNumber(values.startWeightKg);
	const targetWeightKg = coerceNullableNumber(values.targetWeightKg);
	const fieldErrors: NonNullable<WeightTrackingActionData['goal']>['fieldErrors'] = {};

	if (!isIsoDate(values.startDate)) fieldErrors.startDate = 'Choose a valid start date.';
	if (Number.isNaN(startWeightKg) || startWeightKg == null || startWeightKg <= 0) {
		fieldErrors.startWeightKg = 'Start weight must be greater than zero.';
	}
	if (Number.isNaN(targetWeightKg) || targetWeightKg == null || targetWeightKg <= 0) {
		fieldErrors.targetWeightKg = 'Target weight must be greater than zero.';
	}
	if (startWeightKg != null && targetWeightKg != null && targetWeightKg >= startWeightKg) {
		fieldErrors.targetWeightKg = 'Target weight must be below start weight.';
	}

	if (Object.keys(fieldErrors).length > 0) {
		return fail(400, { goal: { values, fieldErrors } });
	}

	const { error } = await supabase.rpc('create_weight_goal_revision', {
		p_start_date: values.startDate,
		p_start_weight_kg: Number(startWeightKg),
		p_target_weight_kg: Number(targetWeightKg)
	});

	if (error) {
		return fail(500, { goal: { values, formError: 'Could not save goal.' } });
	}

	return { message: 'Goal saved.' };
}
