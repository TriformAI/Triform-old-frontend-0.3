<script lang="ts">
	import IconClose from '~icons/mdi/close'

	let {
		tags = $bindable([]),
		label,
		placeholder = 'Add tag...',
		hideLabel = false,
		containerClass,
		readonly = false,
		variation = 'default',
		onChange,
		presetTags = [],
		allowNewTags = true
	}: {
		tags: string[]
		label?: string
		placeholder?: string
		hideLabel?: boolean
		containerClass?: string
		readonly?: boolean
		variation?: 'default' | 'tight'
		onChange?: (tags: string[]) => void
		presetTags?: string[]
		allowNewTags?: boolean
	} = $props()

	let inputValue = $state('')
	let inputEl = $state<HTMLInputElement | null>(null)
	let showDropdown = $state(false)
	let dropdownContainer = $state<HTMLDivElement | null>(null)

	const id = Math.random().toString(36).substring(2, 15)

	const filteredPresetTags = $derived.by(() => {
		if (!presetTags.length) return []

		const availableTags = presetTags.filter(tag => !tags.includes(tag))

		if (!inputValue.trim()) return availableTags

		const search = inputValue.toLowerCase()
		return availableTags.filter(tag => tag.toLowerCase().includes(search))
	})

	const addTag = (tag?: string) => {
		const trimmed = tag?.trim() || inputValue.trim()
		if (!trimmed || tags.includes(trimmed)) return

		// If allowNewTags is false and this tag is not in presetTags, don't add it
		if (!allowNewTags && presetTags.length && !presetTags.includes(trimmed)) return

		tags = [...tags, trimmed]
		inputValue = ''
		onChange?.(tags)
	}

	const removeTag = (index: number) => {
		tags = tags.filter((_, i) => i !== index)
		onChange?.(tags)
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault()
			addTag()
		} else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
			removeTag(tags.length - 1)
		} else if (e.key === 'Escape') {
			showDropdown = false
		}
	}

	const handleBlur = (e: FocusEvent) => {
		// Check if the related target is within the dropdown
		const relatedTarget = e.relatedTarget as Node | null
		if (relatedTarget && dropdownContainer?.contains(relatedTarget)) return

		showDropdown = false
		if (!inputValue.trim()) return
		if (allowNewTags || (presetTags.length && presetTags.includes(inputValue.trim()))) {
			addTag()
		}
	}

	const handleFocus = () => {
		if (presetTags.length) {
			showDropdown = true
		}
	}

	const handleInput = () => {
		if (presetTags.length) {
			showDropdown = true
		}
	}
</script>

<div class={['grid gap-1', containerClass]}>
	{#if label}
		<label for={id} class={['input-title', hideLabel && 'sr-only']}>{label}</label>
	{/if}

	<div class="relative">
		<div
			class={[
				'input-text flex flex-wrap items-center gap-1.5',
				'focus-within:border-main-600',
				variation === 'default' && 'p-2',
				variation === 'tight' && 'p-1'
			]}
			onclick={() => inputEl?.focus()}
			onkeydown={e => {
				if (e.key === 'Enter' || e.key === ' ') inputEl?.focus()
			}}
			role="button"
			tabindex="0"
		>
			{#each tags as tag, i}
				<span
					class={[
						'bg-main-850 text-main-200 inline-flex items-center gap-1 rounded px-2 py-0.5 text-sm',
						!readonly && 'pr-1'
					]}
				>
					{tag}
					{#if !readonly}
						<button
							type="button"
							onclick={() => removeTag(i)}
							class="text-main-400 hover:text-main-200 hover:bg-main-800 rounded p-0.5 transition-colors"
						>
							<IconClose class="size-3.5" />
						</button>
					{/if}
				</span>
			{/each}

			{#if !readonly}
				<input
					{id}
					type="text"
					bind:this={inputEl}
					bind:value={inputValue}
					onkeydown={handleKeydown}
					onblur={handleBlur}
					onfocus={handleFocus}
					oninput={handleInput}
					{placeholder}
					class="min-w-[120px] flex-1 bg-transparent outline-none"
				/>
			{/if}
		</div>

		{#if showDropdown && filteredPresetTags.length > 0}
			<div
				bind:this={dropdownContainer}
				class="border-main-700 bg-main-800 absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-lg"
			>
				{#each filteredPresetTags as presetTag}
					<button
						type="button"
						class="hover:bg-main-750 w-full px-3 py-2 text-left text-sm transition-colors"
						onclick={() => addTag(presetTag)}
						onmousedown={e => e.preventDefault()}
					>
						{presetTag}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
