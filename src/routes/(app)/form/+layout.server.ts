import { requireUser } from '$lib/auth';
import { loadWeightTrackingData } from '$lib/features/weight-tracking/index.server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals, { next: url.pathname });
	return {
		weightTracking: await loadWeightTrackingData({ supabase: locals.supabase, userId: user.id })
	};
};
