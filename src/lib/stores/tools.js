import { writable } from 'svelte/store';
import toolbar_icon_1 from '$lib/icons/toolbar_icon_1.svg';
import toolbar_icon_2 from '$lib/icons/toolbar_icon_2.svg';
import toolbar_icon_3 from '$lib/icons/toolbar_icon_3.svg';
import toolbar_icon_4 from '$lib/icons/toolbar_icon_4.svg';
import toolbar_icon_5 from '$lib/icons/toolbar_icon_5.svg';
import toolbar_icon_6 from '$lib/icons/toolbar_icon_6.svg';
import toolbar_icon_7 from '$lib/icons/toolbar_icon_7.svg';
import more_tools_2 from '$lib/icons/more_tools_2.svg';

import {
	componentToolsBoxModal,
	environmentModal,
	tokenModal,
	storageModal,
	templateLibraryModal,
	propertyModal,
	consoleModal
} from './modals';

export const iconsStore = writable([
	{
		id: 1,
		icon: toolbar_icon_1,
		alt: 'Component toolbox',
		visibleOnToolbar: true,
		modalComponent: componentToolsBoxModal
	},
	{
		id: 2,
		icon: toolbar_icon_2,
		alt: 'Properties',
		visibleOnToolbar: true,
		modalComponent: propertyModal
	},
	{
		id: 3,
		icon: toolbar_icon_3,
		alt: 'Environment variables',
		visibleOnToolbar: true,
		modalComponent: environmentModal
	},
	{
		id: 4,
		icon: toolbar_icon_4,
		alt: 'Console',
		visibleOnToolbar: true,
		modalComponent: consoleModal
	},
	{
		id: 5,
		icon: toolbar_icon_5,
		alt: 'Templates',
		visibleOnToolbar: true,
		modalComponent: templateLibraryModal
	},
	{
		id: 6,
		icon: toolbar_icon_6,
		alt: 'Storage',
		visibleOnToolbar: true,
		modalComponent: storageModal
	},
	{
		id: 7,
		icon: toolbar_icon_7,
		alt: 'API tokens',
		visibleOnToolbar: true,
		modalComponent: tokenModal
	},
	{
		id: 9,
		icon: more_tools_2,
		alt: 'More tools',
		visibleOnToolbar: false,
		modalComponent: null
	}
]);

export function toggleIconVisibility(id) {
	iconsStore.update((icons) =>
		icons.map((icon) =>
			icon.id === id ? { ...icon, visibleOnToolbar: !icon.visibleOnToolbar } : icon
		)
	);
}
