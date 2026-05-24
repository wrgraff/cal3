import { redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/auth';
import { isIsoDate, todayIso, upsertWeightEntry } from '$lib/features/weight-tracking/index.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const date = url.searchParams.get('date');
	const currentWeightParam = url.searchParams.get('currentWeightKg');
	const currentWeightNumber = currentWeightParam == null ? NaN : Number(currentWeightParam);

	return {
		initialDate: date && isIsoDate(date) ? date : todayIso(),
		initialWeightKg:
			Number.isFinite(currentWeightNumber) && currentWeightNumber > 0
				? currentWeightNumber.toFixed(2)
				: ''
	};
};

export const actions: Actions = {
	upsertWeightEntry: async ({ locals, request }) => {
		const user = await requireUser(locals, { next: '/shape/weight' });
		const result = await upsertWeightEntry(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);

		if (result && typeof result === 'object' && 'status' in result) {
			return result;
		}

		throw redirect(303, '/shape?notice=weight-saved');
	}
};
