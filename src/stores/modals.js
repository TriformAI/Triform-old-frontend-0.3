// src/stores/ui.js
import { writable } from 'svelte/store';

export const dropdownOpen = writable(false);
export const notificationOpen = writable(false);
export const canvasDropdownOpen = writable(false);