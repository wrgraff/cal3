import { requireUser } from '$lib/auth';
import {
	createGoalRevision,
	deleteBodyMeasurement,
	deleteWeightEntry,
	loadWeightFormData,
	upsertBodyMeasurement,
	upsertWeightEntry
} from '$lib/features/weight-form/index.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals, { next: '/form' });
	return {
		weightForm: await loadWeightFormData({ supabase: locals.supabase, userId: user.id })
	};
};

export const actions: Actions = {
	upsertWeightEntry: async ({ locals, request }) => {
		const user = requireUser(locals, { next: '/form' });
		return upsertWeightEntry(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	},
	deleteWeightEntry: async ({ locals, request }) => {
		const user = requireUser(locals, { next: '/form' });
		return deleteWeightEntry(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	},
	upsertBodyMeasurement: async ({ locals, request }) => {
		const user = requireUser(locals, { next: '/form' });
		return upsertBodyMeasurement(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	},
	deleteBodyMeasurement: async ({ locals, request }) => {
		const user = requireUser(locals, { next: '/form' });
		return deleteBodyMeasurement(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	},
	createGoalRevision: async ({ locals, request }) => {
		const user = requireUser(locals, { next: '/form' });
		return createGoalRevision(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	}
};
