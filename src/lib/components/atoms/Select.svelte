<script lang="ts">
	import { Select } from 'bits-ui'
	import type { Component } from 'svelte'
	import { fly } from 'svelte/transition'
	import KeyboardArrowDownRounded from '~icons/material-symbols/keyboard-arrow-down-rounded'
	import KeyboardArrowUpRounded from '~icons/material-symbols/keyboard-arrow-up-rounded'

	type SelectItem = {
		value: string
		label: string
		disabled?: boolean
		icon?: Component | typeof KeyboardArrowUpRounded
	}

	let {
		value = $bindable(),
		items = [],
		label,
		placeholder = 'Select an option',
		class: classProp,
		containerClass,
		hideLabel = false,
		required = false,
		readonly = false,
		disabled = false,
		portal,
		contentClass,
		triggerClass,
		onChange,
		id: customId
	}: {
		value?: string | string[]
		items?: SelectItem[]
		label?: string
		placeholder?: string
		class?: string
		containerClass?: string
		hideLabel?: boolean
		required?: boolean
		readonly?: boolean
		disabled?: boolean
		portal?: HTMLElement
		contentClass?: string
		triggerClass?: string
		onChange?: (value: string | string[]) => void
		id?: string
	} = $props()

	const id = customId ?? Math.random().toString(36).substring(2, 15)

	const selectedItem = $derived.by(() => {
		if (!value || Array.isArray(value)) return undefined
		return items.find(item => item.value === value)
	})

	const selectedLabel = $derived.by(() => {
		if (!value) return placeholder
		if (Array.isArray(value)) {
			if (value.length === 0) return placeholder
			const labels = value.map(v => items.find(item => item.value === v)?.label).filter(Boolean)
			return labels.join(', ')
		}
		return selectedItem?.label ?? placeholder
	})

	const isMultiple = $derived(Array.isArray(value))
</script>

<div class={['grid gap-1', containerClass]}>
	{#if label}
		<label for={id} class={['input-title', hideLabel && 'sr-only']}>{label}</label>
	{/if}

	<Select.Root
		{items}
		type={isMultiple ? 'multiple' : 'single'}
		bind:value={value as never}
		{disabled}
		{required}
		onValueChange={onChange}
	>
		<Select.Trigger
			{id}
			aria-label={label ?? placeholder}
			class={[
				'input-text group peer',
				'flex items-center justify-between gap-2',
				'disabled:text-main-400 disabled:cursor-not-allowed',
				readonly && 'bg-main-850! cursor-not-allowed',
				triggerClass,
				classProp
			]}
			disabled={disabled || readonly}
		>
			<div class={['flex items-center gap-1 truncate', value ? 'text-main-300' : 'text-main-400']}>
				{#if selectedItem?.icon}
					{@const SelectedIcon = selectedItem.icon}
					<div class="size-5 shrink-0">
						<SelectedIcon />
					</div>
				{/if}
				<span class="truncate">
					{selectedLabel}
				</span>
			</div>
			<KeyboardArrowDownRounded
				class="text-main-500 size-5 shrink-0 transition-transform group-data-[state=open]:rotate-180"
			/>
		</Select.Trigger>

		<Select.Portal to={portal}>
			<Select.Content
				class={[
					'bg-main-900 border-main-800 custom-scrollbar',
					'z-50 max-h-80 w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)]',
					'overflow-y-auto rounded-md border shadow-lg',
					contentClass
				]}
				sideOffset={4}
				forceMount
			>
				{#snippet child({ wrapperProps, props, open })}
					{#if open}
						<div {...wrapperProps}>
							<div {...props} transition:fly={{ y: -10, duration: 400 }}>
								<Select.ScrollUpButton
									class="text-main-400 hover:text-main-300 flex h-6 w-full items-center justify-center transition"
								>
									<KeyboardArrowUpRounded class="size-5" />
								</Select.ScrollUpButton>

								<Select.Viewport class="p-1">
									{#each items as item (item.value)}
										<Select.Item
											value={item.value}
											label={item.label}
											disabled={item.disabled}
											class={[
												'text-main-300 hover:bg-main-800 hover:text-main-200',
												'data-highlighted:bg-main-800 data-highlighted:text-main-200',
												'data-selected:bg-main-700 data-selected:text-main-100',
												'data-disabled:cursor-not-allowed data-disabled:opacity-50',
												'flex h-9 w-full cursor-pointer items-center gap-2 select-none',
												'rounded px-3 py-2 text-sm transition-colors outline-none'
											]}
										>
											{#snippet children()}
												{@const Icon = item.icon}
												{#if Icon}
													<div class="size-5 shrink-0">
														<Icon />
													</div>
												{/if}
												<span class="truncate">{item.label}</span>
											{/snippet}
										</Select.Item>
									{/each}
								</Select.Viewport>

								<Select.ScrollDownButton
									class="text-main-400 hover:text-main-300 flex h-6 w-full items-center justify-center transition"
								>
									<KeyboardArrowDownRounded class="size-5" />
								</Select.ScrollDownButton>
							</div>
						</div>
					{/if}
				{/snippet}
			</Select.Content>
		</Select.Portal>
	</Select.Root>
</div>
