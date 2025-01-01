<script>
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg'
	import search_icon from '$lib/icons/search.svg'
	import Button from '$lib/components/Button.svelte'
	import Add from '$lib/icons/add.svg'
	import dots from '$lib/icons/dots.svg'
	import DeleteEditModal from './DeleteEditModal.svelte'
	import { onMount } from 'svelte'
	import { PUBLIC_API_URL } from '$env/static/public'
	import { getAuthToken } from '$lib/stores/cookie'
	import Spinner from '../Spinner.svelte'
	import { get } from 'svelte/store'
	import { mainAreaRef } from '$lib/stores/layoutRefs.svelte'
	import ToolWindow from '$lib/components/ToolWindow.svelte'
	import { tokenModal } from '$lib/stores/modals'

	let apiUrl = PUBLIC_API_URL
	let authToken = getAuthToken()

	let searchTerm = $state('')
	let edit_delete_modal = $state(false)
	let activeIndex = $state(null)
	let tokens = $state([])
	let filteredTokens = $derived(
		tokens.filter(token => token.name.toLowerCase().includes(searchTerm.toLowerCase()))
	)

	let showTokenForm = $state(false)
	let isEditing = $state(false)
	let editTokenId = null
	let tokenForm = $state({ name: '' })
	let nameInput = $state(undefined)
	let error = $state('')
	let loading = $state(false)

	onMount(() => {
		fetchTokens()
	})

	// Fetch API tokens
	async function fetchTokens() {
		try {
			loading = true
			const response = await fetch(`${apiUrl}/api/v1/tokens`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			})
			const data = await response.json()
			loading = false
			tokens = data.data.map(item => ({
				id: item.id,
				name: item.name,
				token: item.token,
				last_used_at: item.last_used_at,
				expires_at: item.expires_at,
				created_at: item.created_at,
				visible: false,
				copied: false
			}))
		} catch (error) {
			loading = false
			console.error('Error fetching tokens:', error)
		}
	}

	// Save (Create or Update) API token
	async function saveToken() {
		const { name } = tokenForm

		try {
			const url = isEditing ? `${apiUrl}/api/v1/tokens/${editTokenId}` : `${apiUrl}/api/v1/tokens`
			const method = isEditing ? 'PATCH' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify({ name })
			})

			const data = await response.json()
			if (response.ok) {
				await fetchTokens() // Refresh tokens after saving
				closeForm()
				error = '' // Clear any previous error
			} else {
				error = data.errors.name || data.errors || ''
				console.error('Error:', error)
			}
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.'
			console.error('Error saving token:', err)
		}
	}

	// Delete an API token
	async function handleDelete(id) {
		try {
			const response = await fetch(`${apiUrl}/api/v1/tokens/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			})

			if (response.ok) {
				tokens = tokens.filter(token => token.id !== id) // Remove from local state
				error = '' // Clear any previous error
			} else {
				console.error('Error deleting token')
			}
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.'
			console.error('Error deleting token:', err)
		}
	}

	// Edit an API token
	function handleEdit(id) {
		const token = tokens.find(t => t.id === id)
		if (token) {
			isEditing = true
			editTokenId = id
			tokenForm = { name: token.name }
			showTokenForm = true

			setTimeout(() => nameInput.focus(), 0)
		}
	}

	// Open form for creating a new token
	function openAddTokenForm() {
		isEditing = false
		editTokenId = null
		tokenForm = { name: '' }
		showTokenForm = true
		error = ''

		setTimeout(() => nameInput.focus(), 0)
	}

	// Close the form and reset state
	function closeForm() {
		showTokenForm = false
		isEditing = false
		editTokenId = null
		tokenForm = { name: '' }
		error = ''
	}

	// Copy token to clipboard and display check icon
	function copyToken(token) {
		navigator.clipboard.writeText(token.token).then(() => {
			token.copied = true

			// Reset `copied` state after a delay
			setTimeout(() => {
				token.copied = false
			}, 2000)
		})
	}

	// Toggle visibility of a specific token
	function toggleVisibility(index) {
		tokens = tokens.map((token, i) => (i === index ? { ...token, visible: !token.visible } : token))
	}

	// Toggle the Edit/Delete modal at the specific index
	function toggleEditDeleteModal(index) {
		if (activeIndex === index) {
			activeIndex = null
			edit_delete_modal = false
		} else {
			activeIndex = index
			edit_delete_modal = true
		}
	}

	function toggleModal() {
		tokenModal.update(value => !value)
	}
</script>

<ToolWindow
	initialSize={{ width: 26 * 16, height: 577 }}
	initialPosition={{ x: 23, y: 7 * 3 }}
	boundsRef={mainAreaRef()}
	headerIcon={modal_title_icon}
	inScale={{ start: 0.9, duration: 200 }}
	outFade={{ duration: 150 }}
	headerText="API Tokens"
	{toggleModal}
>
	<!-- Modal Header -->
	<div
		class="relative flex items-center w-full px-4 py-5 border-b gap-y-5 border-brand-primary-gray"
	>
		<input
			id="search"
			type="text"
			placeholder="Search Anything..."
			class="w-full px-4 py-3 text-xs border rounded-md bg-website-secondary border-brand-primary-gray"
			bind:value={searchTerm}
		/>
		<img src={search_icon} alt="search_icon" class="absolute inset-y-0 w-5 right-6 top-6" />
	</div>

	<!-- Add/Edit Token Form -->
	{#if showTokenForm}
		<div class="flex flex-col p-4 overflow-y-auto grow gap-y-4 bg-website-primary">
			<input
				type="text"
				bind:this={nameInput}
				bind:value={tokenForm.name}
				placeholder="Token Name"
				class="w-full p-2 text-white bg-transparent border rounded-md border-brand-primary-gray"
			/>
			{#if error}
				<p class="mt-2 text-sm text-center text-red-500">{error}</p>
			{/if}
		</div>
		<div
			class="flex items-center justify-end px-6 py-3 border-t gap-x-5 bg-website-primary border-brand-primary-gray"
		>
			<Button content={{ width: 'fit', text: 'Cancel' }} on:click={closeForm} />
			<Button
				content={{ width: 'fit', text: isEditing ? 'Update' : 'Create' }}
				on:click={saveToken}
			/>
		</div>
	{:else if loading}
		<div class="flex items-center justify-center p-4 grow">
			<Spinner />
		</div>
	{:else}
		<!-- Collapsible Category List -->
		<div class="py-3 overflow-y-auto grow bg-website-primary">
			{#if tokens.length === 0}
				<div class="flex items-center justify-center h-full">
					<p class="text-white">No API Tokens Found.</p>
				</div>
			{:else}
				{#each filteredTokens as token, i}
					<div
						class={`group flex items-center justify-between w-full duration-200 ease-in-out 
						${activeIndex === i ? 'bg-website-tertiary' : `${!edit_delete_modal && 'hover:bg-website-tertiary'}`}`}
					>
						<button class="flex flex-col w-full px-6 py-4">
							<h3 class="my-1 text-md truncate w-[13rem] text-left">{token.name}</h3>
							{#if token.visible}
								<p class="w-[13rem] text-left truncate text-gray-400 font-bold text-sm">
									{token.token}
								</p>
							{:else}
								<p>*******</p>
							{/if}
						</button>
						{#if edit_delete_modal && activeIndex === i}
							<DeleteEditModal
								on:click={e => e.stopPropagation()}
								on:edit={() => handleEdit(token.id)}
								on:delete={() => handleDelete(token.id)}
							/>
						{/if}
						<div
							class={`items-center hidden mr-3 duration-200 ease-in-out ${!edit_delete_modal && 'group-hover:flex'} gap-x-4`}
						>
							{#if navigator.clipboard}
								<button class="w-5" aria-label="Copy Value" onclick={() => copyToken(token)}>
									{#if token.copied}
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
												d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
											/>
										</svg>
									{:else}
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
									{/if}
								</button>
							{/if}

							<button class="w-5" onclick={() => toggleVisibility(i)} aria-label="Toggle Value">
								{#if token.visible}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
										<path
											fill="#ffffff"
											d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
										/>
									</svg>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
										<path
											fill="#ffffff"
											d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z"
										/>
									</svg>
								{/if}
							</button>
							<button
								type="button"
								class="w-5 cursor-pointer"
								onclick={e => {
									e.stopPropagation()
									toggleEditDeleteModal(i)
								}}
							>
								<img src={dots} alt="dots" class="w-5" />
							</button>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Modal Footer -->
		<div
			class="flex items-center justify-center p-6 border-t bg-website-primary border-brand-primary-gray"
		>
			<Button content={{ width: 'full', icon: Add, text: 'New API' }} on:click={openAddTokenForm} />
		</div>
	{/if}
</ToolWindow>
