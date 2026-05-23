export type AppTabId = 'intake' | 'form' | 'activity' | 'settings';

export interface AppTab {
	id: AppTabId;
	label: string;
	href: string;
	disabled?: boolean;
}
