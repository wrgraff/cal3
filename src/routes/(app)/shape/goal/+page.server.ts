import { requireUser } from '$lib/auth';
import { createGoalRevision, loadWeightGoalData } from '$lib/features/weight-tracking/index.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	weightTracking: await loadWeightGoalData({ supabase: locals.supabase })
});

export const actions: Actions = {
	createGoalRevision: async ({ locals, request }) => {
		const user = await requireUser(locals, { next: '/shape/goal' });
		return createGoalRevision(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	}
};
