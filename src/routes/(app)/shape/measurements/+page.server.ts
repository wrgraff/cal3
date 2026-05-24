import { requireUser } from '$lib/auth';
import {
	deleteBodyMeasurement,
	isIsoDate,
	loadBodyMeasurementData,
	todayIso,
	upsertBodyMeasurement
} from '$lib/features/weight-tracking/index.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const date = url.searchParams.get('date');
	return {
		initialDate: date && isIsoDate(date) ? date : todayIso(),
		weightTracking: await loadBodyMeasurementData({ supabase: locals.supabase })
	};
};

export const actions: Actions = {
	upsertBodyMeasurement: async ({ locals, request }) => {
		const user = await requireUser(locals, { next: '/shape/measurements' });
		return upsertBodyMeasurement(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	},
	deleteBodyMeasurement: async ({ locals, request }) => {
		const user = await requireUser(locals, { next: '/shape/measurements' });
		return deleteBodyMeasurement(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	}
};
