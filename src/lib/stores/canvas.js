import { writable } from 'svelte/store';

export const tabs = writable([{ id: 1, label: 'Canvas 1' }]);
export const nextTabId = writable(2);
export const activeTabId = writable(1);

export function addTab() {
	let newId;
	tabs.update((currentTabs) => {
		nextTabId.update((id) => {
			newId = id;
			return id + 1;
		});

		return [...currentTabs, { id: newId, label: `Canvas ${newId}` }];
	});

	activeTabId.set(newId);
}

export function removeTab(id) {
	tabs.update((currentTabs) => {
		const updatedTabs = currentTabs.filter((tab) => tab.id !== id);
		if (updatedTabs.length > 0) {
			activeTabId.set(updatedTabs[0].id);
		} else {
			activeTabId.set(null);
		}
		return updatedTabs;
	});
}

export function setActiveTab(id) {
	activeTabId.set(id);
}
