import { SvelteSet } from "svelte/reactivity";

export const inProgressComponents = $state(new SvelteSet<string>())