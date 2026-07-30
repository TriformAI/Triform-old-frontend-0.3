<script lang="ts">
	interface Props {
		label: string
		description: string
		enabled: boolean
		/** false when the selected model rejects this param — shown but not toggleable */
		supported?: boolean
		value: number | undefined | null
		defaultValue: number
		min: number
		max?: number
		step: number
		onToggle: () => void
		onInput: () => void
	}

	let {
		label,
		description,
		enabled,
		supported = true,
		value = $bindable(),
		defaultValue,
		min,
		max,
		step,
		onToggle,
		onInput
	}: Props = $props()
</script>

<div
	class={[
		'bg-main-900 flex flex-row justify-between gap-2 rounded-md p-3 pr-4 pb-4',
		!enabled && 'opacity-50'
	]}
>
	<div class="flex flex-1 flex-col gap-2">
		<span class="text-main-400 text-sm font-medium">{label}</span>
		{#if enabled && supported}
			<input
				{min}
				{max}
				{step}
				class="input-text max-w-3xs"
				type="number"
				oninput={onInput}
				bind:value
			/>
		{:else}
			<span class="text-main-300 ms-1">{description}</span>
		{/if}
	</div>
	<input
		type="checkbox"
		class="checkbox mt-1 size-[1.3rem]"
		disabled={!supported}
		bind:checked={enabled}
		oninput={onToggle}
	/>
</div>
