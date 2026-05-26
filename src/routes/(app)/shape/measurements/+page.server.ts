import { redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/auth';
import { upsertBodyMeasurement } from '$lib/features/weight-tracking/index.server';
import type { Actions } from './$types';

export const actions: Actions = {
	upsertBodyMeasurement: async ({ locals, request }) => {
		const user = await requireUser(locals, { next: '/shape/measurements' });
		const result = await upsertBodyMeasurement(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);

		if (result && typeof result === 'object' && 'status' in result) {
			return result;
		}

		throw redirect(303, '/shape?notice=measurements-saved');
	}
};
