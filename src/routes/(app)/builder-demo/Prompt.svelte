<script lang="ts">
	let { onSubmit } = $props()
	import { animate, stagger } from 'motion'
	import { onMount } from 'svelte'
	import TypeWriter from './TypeWriter.svelte'
	import IconArrowUp from '~icons/material-symbols/arrow-upward-alt'

	let textarea = $state<HTMLElement>()

	let disableAnimation = $state(false)

	let aiMsgs = [
		`👋 Hey! Let's build a flow together! Please describe the intention, input and the expected output of the flow.`,
		'Got it! I am ready to start building your flow. Ready to go?'
	]

	function showAll() {
		showForm()
		disableAnimation = true
		chatHistory = [
			aiMsgs[0],
			'Please build a flow for me. Make it simple and easy to follow.',
			aiMsgs[1]
		]
		aiMsgs = []
	}

	async function sendAiMsg() {
		if (aiMsgs.length === 0) {
			await goToFlow()
			return
		}
		chatHistory.push(aiMsgs[0])
		aiMsgs.shift()
	}

	function sendUserMsg() {
		if (userInput.trim() === '') {
			textarea?.focus()
			return
		}

		setTimeout(() => {
			chatHistory.push(userInput)
			userInput = ''
			sendAiMsg()
			textarea?.blur()
		}, 200)
	}

	async function showForm() {
		await animate(
			'[data-motion]',
			{ opacity: 1, y: 0 },
			{ duration: 0.5, delay: stagger(0.2), ease: 'circOut' }
		)
		//await animate(submitBtn, { opacity: 1 })
		textarea?.focus()
	}

	async function goToFlow() {
		setTimeout(async () => {
			const chatMsgs = document.querySelectorAll('.chat-msg')
			if (chatMsgs.length) {
				await animate(
					'.chat-msg',
					{ opacity: 0, y: 0 },
					{ duration: 0.5, delay: stagger(0.2), ease: 'circOut' }
				)
			}

			await animate('form', { opacity: 0, y: 0 }, { duration: 0.5, ease: 'circOut' })
			await animate('#lucky-btn', { opacity: 0, y: 0 }, { duration: 0.5, ease: 'circOut' })

			onSubmit()
		}, 500)
	}

	let userInput = $state('')
	let chatHistory = $state<string[]>([])

	onMount(() => {
		sendAiMsg()
		//showAll()
	})
</script>

<div class="m-auto">
	<div class="w-2xl rounded p-6">
		<ul class="grid gap-4 px-4">
			{#each chatHistory as msg, i}
				<li class="chat-msg flex">
					{#if i % 2 === 0}
						<TypeWriter
							delay={i === 0 ? 2000 : 1000}
							{disableAnimation}
							autoplay={true}
							speed="fast"
							class="text-main-100 max-w-4/5 text-lg font-medium"
							text={msg}
							onComplete={async () => {
								if (i === 0) {
									showForm()
								} else {
									textarea?.focus()
								}
							}}
						/>
					{:else}
						<p
							class="animate-fade-in bg-main-800/50 ms-auto inline-flex max-w-4/5 rounded-full px-6 py-2 text-lg"
						>
							{msg}
						</p>
					{/if}
				</li>
			{/each}
		</ul>

		<form class="relative mt-4 grid gap-4">
			<textarea
				bind:this={textarea}
				onkeydown={e => {
					if (e.key === 'Enter' && e.metaKey) {
						sendUserMsg()
					}
				}}
				bind:this={textarea}
				bind:value={userInput}
				data-motion
				rows="1"
				class="input resize-none pe-16 opacity-0"
			></textarea>

			<div class="absolute end-2 bottom-2 ms-auto" data-motion>
				<button
					type="button"
					onclick={sendUserMsg}
					class="btn bg-main-300 hover:bg-main-200 aspect-square origin-bottom rounded-full p-2 transition-all duration-300 hover:scale-110"
				>
					<IconArrowUp class="text-accent-600 size-6" />
				</button>
			</div>
		</form>
	</div>

	<div class="flex justify-center" data-motion>
		<button id="lucky-btn" type="button" class="btn btn--dark text-sm" onclick={goToFlow}>
			I'm feeling lucky
		</button>
	</div>
</div>

<style lang="postcss">
	[data-motion] {
		opacity: 0;
		transform: translateY(30px);
	}
</style>
