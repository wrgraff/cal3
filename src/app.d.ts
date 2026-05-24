// See https://svelte.dev/docs/kit/types#app for details on the App namespace.

import type { AuthUser } from '$lib/auth';
import type { createSupabaseServerClient } from '$lib/server/supabase';

declare global {
	namespace App {
		// Error type — extend for typed structured errors.
		// interface Error {}

		interface Locals {
			supabase: ReturnType<typeof createSupabaseServerClient>;
			safeGetUser: () => Promise<AuthUser | null>;
		}

		interface PageData {
			user?: AuthUser | null;
		}

		// interface PageState {}
		// interface Platform {}
	}
}

export {};
