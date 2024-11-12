// src/stores/ui.js
import { writable } from 'svelte/store';

export const profileDropdown = writable(false);
export const notificationOpen = writable(false);
export const canvasDropdownOpen = writable(false);
export const canvasToolsModal = writable(false);
export const freeFormAutoArrangeModal = writable(false);
export const searchModal = writable(false);
export const componentToolsBoxModal = writable(false);
export const environmentModal = writable(false);
export const tokenModal = writable(false);
export const storageModal = writable(false);
export const templateLibraryModal = writable(false);
export const propertyModal = writable(false);
export const consoleModal = writable(false);
export const statusModal = writable(false);

export const createModuleModal = writable(false);
export const attachTemplateModal = writable(false);
export const moduleInfoModal = writable(false);
export const footerPanel = writable(false);
export const thresholdModal = writable(false);
export const renameMode = writable(false);
export const templateModal = writable(false);
export const shareCanvaModal = writable(false);

//make a general toggle function for a specific modal as input parameter and make all other modals false
export function toggleModal(modal) {
	profileDropdown.set(false);
	notificationOpen.set(false);
	canvasDropdownOpen.set(false);
	canvasToolsModal.set(false);
	freeFormAutoArrangeModal.set(false);
	searchModal.set(false);
	componentToolsBoxModal.set(false);
	environmentModal.set(false);
	tokenModal.set(false);
	storageModal.set(false);
	templateLibraryModal.set(false);
	propertyModal.set(false);
	consoleModal.set(false);
	statusModal.set(false);
	renameMode.set(false);
	templateModal.set(false);
	shareCanvaModal.set(false);

	modal.set(true);
}
