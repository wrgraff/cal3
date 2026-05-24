import { redirect } from '@sveltejs/kit';
import type { AuthUser } from './admin';

interface RequireUserOptions {
	next?: string;
}

function createLoginRedirectUrl(next?: string): string {
	if (!next) {
		return '/login';
	}

	return `/login?next=${encodeURIComponent(next)}`;
}

export async function requireUser(
	locals: Pick<App.Locals, 'safeGetUser'>,
	options: RequireUserOptions = {}
): Promise<AuthUser> {
	const user = await locals.safeGetUser();

	if (!user) {
		throw redirect(303, createLoginRedirectUrl(options.next));
	}

	return user;
}
