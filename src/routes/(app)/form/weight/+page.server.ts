import { requireUser } from '$lib/auth';
import {
	deleteWeightEntry,
	isIsoDate,
	loadWeightEntryData,
	todayIso,
	upsertWeightEntry
} from '$lib/features/weight-tracking/index.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const date = url.searchParams.get('date');
	return {
		initialDate: date && isIsoDate(date) ? date : todayIso(),
		weightTracking: await loadWeightEntryData({ supabase: locals.supabase })
	};
};

export const actions: Actions = {
	upsertWeightEntry: async ({ locals, request }) => {
		const user = await requireUser(locals, { next: '/form/weight' });
		return upsertWeightEntry(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	},
	deleteWeightEntry: async ({ locals, request }) => {
		const user = await requireUser(locals, { next: '/form/weight' });
		return deleteWeightEntry(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	}
};
