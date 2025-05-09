<script lang="ts">
	import Select from '../atoms/Select.svelte'
	import Card from '$lib/components/common/Card.svelte'
	import { T, getTranslate } from '@tolgee/svelte'
	const { t } = getTranslate()
	import InputField from '../atoms/InputField.svelte'

	const options = [
		{ id: 1, name: 'Wade Cooper' },
		{ id: 2, name: 'Arlene Mccoy' },
		{ id: 3, name: 'Devon Webb' },
		{ id: 4, name: 'Tom Cook' },
		{ id: 5, name: 'Tanya Fox' },
		{ id: 6, name: 'Hellen Schmidt' },
		{ id: 7, name: 'Caroline Schultz' },
		{ id: 8, name: 'Mason Heaney' },
		{ id: 9, name: 'Claudie Smitham' },
		{ id: 10, name: 'Emil Schaefer' }
	]

	let selected = $state([])
</script>

<Card>
	{#snippet title()}
		<T keyName="share-canvas-button" defaultValue="Share Canvas" />
	{/snippet}

	{#snippet body()}
		<div class="flex items-center gap-x-4">
			<button
				class={`hover:border-brand-light-gray border-main-700 text-main-300 flex flex-shrink-0 items-center justify-center gap-x-3 rounded-lg border bg-white/5 px-4 py-2.5 text-sm font-medium transition duration-200 ease-in-out hover:text-white`}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
					/>
				</svg>
				<T keyName="copy-link-button" defaultValue="Copy Link" />
			</button>
			<div class="relative my-2 w-full">
				<InputField
					label={$t('invite-input-label', '')}
					placeholder={$t('invite-input-placeholder', 'Invite users by name or email...')}
					type="text"
				/>
				<button
					class={`text-md rounded-y-lg border-main-700 text-main-300 absolute inset-0 ml-auto w-fit rounded-r-lg border bg-[#262728] px-4 py-3 font-medium transition duration-200 ease-in-out hover:bg-white/10 hover:text-white`}
				>
					<T keyName="invite-link-button" defaultValue="Invite" />
				</button>
			</div>
		</div>
		<div>
			<div class="flex items-center justify-between pt-8">
				<div class="flex items-center gap-x-4">
					<img alt="profile logo" src="https://picsum.photos/100" class="mr-3 w-8 rounded-full" />
					<h4 class="text-sm text-white">Iggy</h4>
				</div>
				<Select {options} bind:selected singleValue={true} />
			</div>
			<div class="flex items-center justify-between pt-8">
				<div class="flex items-center gap-x-4">
					<img alt="profile logo" src="https://picsum.photos/100" class="mr-3 w-8 rounded-full" />
					<h4 class="text-sm text-white">Iggy</h4>
				</div>
				<Select {options} bind:selected singleValue={true} />
			</div>
			<div class="flex items-center justify-between pt-8">
				<div class="flex items-center gap-x-4">
					<img alt="profile logo" src="https://picsum.photos/100" class="mr-3 w-8 rounded-full" />
					<h4 class="text-sm text-white">Iggy</h4>
				</div>
				<Select {options} bind:selected singleValue={true} />
			</div>
		</div>
	{/snippet}
</Card>
