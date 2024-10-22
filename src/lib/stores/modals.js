// src/stores/ui.js
import { writable } from 'svelte/store';

export const profileDropdown = writable(false);
export const notificationOpen = writable(false);
export const canvasDropdownOpen = writable(false);
export const canvasToolsModal = writable(false);
export const freeFormAutoArrangeModal = writable(false);
export const searchModal = writable(false);

//make a general toggle function for a specific modal as input parameter and make all other modals false
export function toggleModal(modal) {
	profileDropdown.set(false);
	notificationOpen.set(false);
	canvasDropdownOpen.set(false);
	canvasToolsModal.set(false);
	freeFormAutoArrangeModal.set(false);
	searchModal.set(false);

	modal.set(true);
}
