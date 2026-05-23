import { requireUser } from '$lib/auth';
import { createGoalRevision } from '$lib/features/weight-form/index.server';
import type { Actions } from './$types';

export const actions: Actions = {
	createGoalRevision: async ({ locals, request }) => {
		const user = requireUser(locals, { next: '/form/goal' });
		return createGoalRevision(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);
	}
};
