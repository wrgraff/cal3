import { redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/auth';
import {
	isIsoDate,
	todayIso,
	upsertBodyMeasurement
} from '$lib/features/weight-tracking/index.server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const date = url.searchParams.get('date');
	const chestParam = url.searchParams.get('chestCm');
	const waistParam = url.searchParams.get('waistCm');
	const hipsParam = url.searchParams.get('hipsCm');

	const chestNumber = chestParam == null ? NaN : Number(chestParam);
	const waistNumber = waistParam == null ? NaN : Number(waistParam);
	const hipsNumber = hipsParam == null ? NaN : Number(hipsParam);

	return {
		initialDate: date && isIsoDate(date) ? date : todayIso(),
		initialChestCm: Number.isFinite(chestNumber) && chestNumber >= 0 ? `${chestNumber}` : '',
		initialWaistCm: Number.isFinite(waistNumber) && waistNumber >= 0 ? `${waistNumber}` : '',
		initialHipsCm: Number.isFinite(hipsNumber) && hipsNumber >= 0 ? `${hipsNumber}` : ''
	};
};

export const actions: Actions = {
	upsertBodyMeasurement: async ({ locals, request }) => {
		const user = await requireUser(locals, { next: '/shape/measurements' });
		const result = await upsertBodyMeasurement(
			{ supabase: locals.supabase, userId: user.id },
			await request.formData()
		);

		if (result && typeof result === 'object' && 'status' in result) {
			return result;
		}

		throw redirect(303, '/shape?notice=measurements-saved');
	}
};
