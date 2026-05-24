import { requireUser } from '$lib/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => ({
	user: await requireUser(locals, { next: url.pathname })
});
