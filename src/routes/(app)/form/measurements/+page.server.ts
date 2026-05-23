import { requireUser } from '$lib/auth';
import {
	deleteBodyMeasurement,
	isIsoDate,
	todayIso,
	upsertBodyMeasurement
} from '$lib/features/weight-tracking/index.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const date = url.searchParams.get('date');
	return {
		initialDate: date && isIsoDate(date) ? date : todayIso()
	};
};

export const actions: Actions = {
	upsertBodyMeasurement: async ({ locals, request }) => {
		const user = requireUser(locals, { next: '/form/measurements' });
		return upsertBodyMeasurement(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	},
	deleteBodyMeasurement: async ({ locals, request }) => {
		const user = requireUser(locals, { next: '/form/measurements' });
		return deleteBodyMeasurement(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	}
};
