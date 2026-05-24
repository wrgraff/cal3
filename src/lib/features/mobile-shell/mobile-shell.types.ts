export type AppTabId = 'intake' | 'shape' | 'activity' | 'settings';

export interface AppTab {
	id: AppTabId;
	label: string;
	href: string;
	disabled?: boolean;
}
