<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity'
	import IconAdd from '~icons/mdi/plus-circle-outline'
	import IconTrash from '~icons/material-symbols/delete-outline'
	import { tick } from 'svelte'

	interface Props {
		value: { id: string; name: string; description: string; type: string }[]
		title: string
	}

	let { value = $bindable(), title }: Props = $props()

	let isDeleting = new SvelteSet<number>()

	function removeItem(index: number) {
		isDeleting.add(index)
	}

	async function addNew() {
		value.push({ id: crypto.randomUUID(), name: '', description: '', type: 'variable' })
		await tick()
		textareas[value.length - 1].focus()
	}

	let textareas = $state<HTMLInputElement[]>([])
</script>

<div class="grid gap-2 text-sm">
	<p class="input-title flex items-center gap-1">
		{title}
		<button type="button" onclick={addNew} class="group grid size-6 place-content-center">
			<IconAdd
				class="group-hover:text-main-200 size-4.5 transition-all duration-200 group-hover:size-5"
			/>
		</button>
	</p>

	{#if value.length}
		<ul>
			{#each value as item, index}
				<li
					{@attach el => {
						const onEnd = () => {
							if (isDeleting.has(index)) {
								value.splice(index, 1)
								isDeleting.delete(index)
							}
						}

						el.addEventListener('transitionend', onEnd)
						return () => el.removeEventListener('transitionend', onEnd)
					}}
					class={[
						'overflow-hidden transition-all transition-discrete duration-300 starting:h-0',
						isDeleting.has(index) ? 'h-0' : ''
					]}
				>
					<div class="grid grid-cols-[1fr_2fr_0.8fr_auto] items-start gap-2 pb-2">
						<label>
							<span class={['block pb-1', index > 0 && 'sr-only']}>Name</span>
							<input
								bind:this={textareas[index]}
								class="input-text w-full px-2 py-1.5"
								bind:value={value[index].name}
							/>
						</label>

						<label>
							<span class={['block pb-1', index > 0 && 'sr-only']}>Description</span>
							<textarea
								class="input-text field-sizing-content max-h-23 w-full px-2 py-1.5"
								bind:value={value[index].description}
							></textarea>
						</label>

						<label>
							<span class={['block pb-1', index > 0 && 'sr-only']}>Type</span>
							<select class="input-text px-2 py-1.5" bind:value={value[index].type}>
								<option value="variable">Variable</option>
								<option value="secret">Secret</option>
							</select>
						</label>

						<button
							type="button"
							onclick={() => removeItem(index)}
							class={[index === 0 ? 'mt-8' : 'mt-2']}
						>
							<IconTrash class="size-4" />
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
