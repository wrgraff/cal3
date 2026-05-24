import { loadWeightTrackingData } from '$lib/features/weight-tracking/index.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => ({
	notice: url.searchParams.get('notice'),
	weightTracking: await loadWeightTrackingData({ supabase: locals.supabase })
});
