import { requireUser } from '$lib/auth';
import { loadWeightFormData } from '$lib/features/weight-form/index.server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals, { next: url.pathname });
	return {
		weightForm: await loadWeightFormData({ supabase: locals.supabase, userId: user.id })
	};
};
