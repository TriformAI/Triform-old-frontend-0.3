<script>
	import { onMount } from 'svelte';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import { get } from 'svelte/store';
	import { mainAreaRef } from '$lib/stores/layoutRefs';
	import ToolWindow from '$lib/components/ToolWindow.svelte';
	import ConsoleLine from '$lib/components/atoms/ConsoleLine.svelte';

	let consoleDiv;
	const scrollToBottom = () => {
		if (consoleDiv) {
			consoleDiv.scrollTop = consoleDiv.scrollHeight;
		}
	};

	onMount(() => {
		scrollToBottom();
	});

	let mainAreaRect = get(mainAreaRef).getBoundingClientRect();
	let mainAreaWidth = mainAreaRect?.width;
	let mainAreaHeight = mainAreaRect?.height;
</script>

<ToolWindow
	initialSize={{ width: 830, height: 277 }}
	initialPosition={{ x: mainAreaWidth / 2 - 830 / 2, y: mainAreaHeight - 277 }}
	boundsRef={get(mainAreaRef)}
	headerIcon={modal_title_icon}
	inScale={{ start: 0.9, duration: 200 }}
	outFade={{ duration: 150 }}
	headerText="Logs and Console"
>
	<div
		bind:this={consoleDiv}
		class="grow overflow-auto px-2 bg-website-dark-primary text-brand-tertiary-gray border-brand-primary-gray"
	>
		<!-- Modal Header -->
		<!-- Collapsible Category List -->
		{#each { length: 16 }}
			<ConsoleLine
				>Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, officia!</ConsoleLine
			>
			<ConsoleLine type="warning"
				>Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, officia!</ConsoleLine
			>
			<ConsoleLine type="error"
				>Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, officia!</ConsoleLine
			>
		{/each}
	</div>
</ToolWindow>
