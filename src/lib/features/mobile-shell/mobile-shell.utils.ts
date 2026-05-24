import type { AppTab, AppTabId } from './mobile-shell.types';

export const APP_TABS: AppTab[] = [
	{ id: 'intake', label: 'Intake', href: '/' },
	{ id: 'shape', label: 'Shape', href: '/shape' },
	{ id: 'activity', label: 'Activity', href: '/activity', disabled: true },
	{ id: 'settings', label: 'Settings', href: '/settings' }
];

export function getActiveTabId(pathname: string): AppTabId {
	if (pathname === '/shape' || pathname.startsWith('/shape/')) {
		return 'shape';
	}

	if (pathname === '/activity') {
		return 'activity';
	}

	if (pathname === '/settings') {
		return 'settings';
	}

	return 'intake';
}
