import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { assignAdminRole, parseAdminEmails } from '$lib/auth';
import { createSupabaseServerClient } from '$lib/server/supabase';

const adminEmails = parseAdminEmails(env.ADMIN_EMAILS);

/**
 * Attach a per-request Supabase client and a safe user helper to
 * `event.locals`. Subsequent hooks and loaders can use these.
 *
 * Reads and writes session cookies through SvelteKit's cookies API.
 */
const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		getAll: () => event.cookies.getAll(),
		setAll: (cookiesToSet) => {
			cookiesToSet.forEach(({ name, value, options }) => {
				event.cookies.set(name, value, { ...options, path: '/' });
			});
		}
	});

	let userPromise: ReturnType<App.Locals['safeGetUser']> | null = null;

	/**
	 * Returns a validated user, or null.
	 * `getUser()` contacts Supabase Auth instead of trusting cookie/session
	 * contents, and the promise is memoized per request for nested loaders.
	 */
	event.locals.safeGetUser = () => {
		userPromise ??= event.locals.supabase.auth.getSession().then(({ data: { session } }) => {
			if (!session) return null;
			return assignAdminRole(session.user, adminEmails);
		});

		return userPromise;
	};

	return resolve(event, {
		// Supabase needs to set these response headers to work over SSR;
		// SvelteKit strips others by default for safety.
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};

export const handle = supabase;
