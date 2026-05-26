import { redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/auth';
import { upsertWeightEntry } from '$lib/features/weight-tracking/index.server';
import type { Actions } from './$types';

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
