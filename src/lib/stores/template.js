// src/lib/stores/templateStore.js
import { writable } from 'svelte/store';

export const templateStore = writable([]);
export const templateLoaded = writable(false);
export const templateID = writable(null);
