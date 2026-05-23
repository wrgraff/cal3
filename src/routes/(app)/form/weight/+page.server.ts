import { requireUser } from '$lib/auth';
import {
	deleteWeightEntry,
	isIsoDate,
	todayIso,
	upsertWeightEntry
} from '$lib/features/weight-form/index.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const date = url.searchParams.get('date');
	return {
		initialDate: date && isIsoDate(date) ? date : todayIso()
	};
};

export const actions: Actions = {
	upsertWeightEntry: async ({ locals, request }) => {
		const user = requireUser(locals, { next: '/form/weight' });
		return upsertWeightEntry(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	},
	deleteWeightEntry: async ({ locals, request }) => {
		const user = requireUser(locals, { next: '/form/weight' });
		return deleteWeightEntry(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	}
};
