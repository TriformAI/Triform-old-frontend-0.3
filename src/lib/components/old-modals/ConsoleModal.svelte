<script>
	import { onMount } from 'svelte'
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg'
	import { get } from 'svelte/store'
	import { mainAreaRef } from '$lib/stores/layoutRefs.svelte'
	import ToolWindow from '$lib/components/ToolWindow.svelte'
	import ConsoleLine from '$lib/components/atoms/ConsoleLine.svelte'
	import { consoleModal } from '$lib/stores/modals'

	let consoleDiv
	const scrollToBottom = () => {
		if (consoleDiv) {
			consoleDiv.scrollTop = consoleDiv.scrollHeight
		}
	}

	onMount(() => {
		scrollToBottom()
	})

	function toggleModal() {
		consoleModal.update(value => !value)
	}

	let mainAreaRect = mainAreaRef().getBoundingClientRect()
	let mainAreaWidth = mainAreaRect?.width
	let mainAreaHeight = mainAreaRect?.height
</script>

<ToolWindow
	initialSize={{ width: 900, height: 200 }}
	initialPosition={{ x: mainAreaWidth / 2 - 900 / 2, y: mainAreaHeight - 200 }}
	boundsRef={mainAreaRef()}
	headerIcon={modal_title_icon}
	inScale={{ start: 0.9, duration: 200 }}
	outFade={{ duration: 150 }}
	headerText="Logs and Console"
	{toggleModal}
>
	<div
		bind:this={consoleDiv}
		class="p-4 overflow-auto grow bg-website-dark-primary text-brand-tertiary-gray border-brand-primary-gray"
	>
		<!-- Modal Header -->
		<ConsoleLine
			>Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, officia!</ConsoleLine
		>
		<ConsoleLine type="warning"
			>Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, officia!</ConsoleLine
		>
		<ConsoleLine type="error"
			>Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, officia!</ConsoleLine
		>
	</div>
</ToolWindow>
