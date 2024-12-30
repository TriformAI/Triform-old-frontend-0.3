<script>
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg'
	import search_icon from '$lib/icons/search.svg'
	import Button from '$lib/components/Button.svelte'
	import Add from '$lib/icons/add.svg'
	import { onMount } from 'svelte'
	import { PUBLIC_API_URL } from '$env/static/public'
	import { getAuthToken } from '$lib/stores/cookie'
	import Spinner from '../Spinner.svelte'
	import { format } from 'date-fns/format'
	import dots from '$lib/icons/dots.svg'
	import DeleteEditModal from './DeleteEditModal.svelte'
	import { toasts } from 'svelte-toasts'
	import { get } from 'svelte/store'
	import { mainAreaRef } from '$lib/stores/layoutRefs'
	import ToolWindow from '$lib/components/ToolWindow.svelte'
	import { storageModal } from '$lib/stores/modals'

	let apiUrl = PUBLIC_API_URL
	let authToken = getAuthToken()

	let storageName = $state('')
	let storageDescription = $state('')
	let error = $state('')
	let searchTerm = $state('')
	let showForm = $state(false)
	let loading = $state(false)
	let isEditing = $state(false)
	let edit_delete_modal = $state(false)
	let activeIndex = $state(null)
	let editingID = $state(null)
	let modules = $state([])
	let selectedModuleIDs = $state({}) // For attach dropdowns
	let selectedAttachedModuleIDs = {} // For detach dropdowns

	// Close the form and reset state
	function closeForm() {
		showForm = false
		isEditing = false
		storageName = ''
		storageDescription = ''
		error = '' // Clear any error message
	}

	function ToggleForm() {
		showForm = !showForm
	}

	let containers = $state([])

	async function fetchModules() {
		try {
			loading = true
			const response = await fetch(`${apiUrl}/api/v1/modules`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			})
			const data = await response.json()
			loading = false
			modules = data.data
			selectedModuleIDs = modules.reduce((acc, module) => {
				acc[module.id] = ''
				return acc
			}, {})
		} catch (error) {
			loading = false
			console.error('Error fetching tokens:', error)
		}
	}

	async function fetchStorage() {
		try {
			loading = true
			const response = await fetch(`${apiUrl}/api/v1/storage/volumes`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			})
			const data = await response.json()
			loading = false
			containers = data.data
		} catch (error) {
			loading = false
			console.error('Error fetching tokens:', error)
		}
	}

	async function createStorage() {
		try {
			loading = true
			const response = await fetch(`${apiUrl}/api/v1/storage/volumes`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify({
					name: storageName,
					description: storageDescription
				})
			})
			const data = await response.json()
			console.log(data)
			loading = false
			if (response.ok && data) {
				closeForm()
				fetchStorage()
			} else {
				error = data.errors.name
			}
		} catch (error) {
			loading = false
			console.error('Error creating storage:', error)
		}
	}

	async function deleteStorage(id) {
		if (!id) return
		try {
			loading = true
			const response = await fetch(`${apiUrl}/api/v1/storage/volumes/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			})
			const data = await response.json()
			console.log(data)
			loading = false
			if (response.ok && data) {
				fetchStorage()
			}
		} catch (error) {
			loading = false
			console.error('Error deleting storage:', error)
		}
	}

	async function updateStorage() {
		if (!editingID) return
		try {
			loading = true
			const response = await fetch(`${apiUrl}/api/v1/storage/volumes/${editingID}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify({
					name: storageName,
					description: storageDescription
				})
			})
			const data = await response.json()
			loading = false
			console.log(data)
			if (response.ok && data) {
				closeForm()
				fetchStorage()
			} else {
				error = data.errors.name
			}
		} catch (error) {
			loading = false
			console.error('Error updating storage:', error)
		}
	}

	async function attachStorage(storageId, moduleId) {
		if (!moduleId || !storageId)
			return toasts.add({
				title: 'Info',
				description: 'Please select a module to attach.',
				duration: 5000,
				placement: 'top-right',
				type: 'error',
				theme: 'dark'
			})

		try {
			loading = true
			const response = await fetch(
				`${apiUrl}/api/v1/modules/${moduleId}/attach/storage/${storageId}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${authToken}`
					}
				}
			)
			const data = await response.json()
			loading = false
			if (response.ok && data) {
				fetchStorage()
			} else {
				error = data.errors?.name || 'Error attaching storage.'
			}
		} catch (error) {
			loading = false
			console.error('Error attaching storage:', error)
		}
	}

	async function detachStorage(storageId, moduleId) {
		if (!moduleId || !storageId)
			return toasts.add({
				title: 'Info',
				description: 'Please select a module to detach.',
				duration: 5000,
				placement: 'top-right',
				type: 'error',
				theme: 'dark'
			})

		try {
			loading = true
			const response = await fetch(
				`${apiUrl}/api/v1/modules/${moduleId}/attach/storage/${storageId}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${authToken}`
					}
				}
			)
			const data = await response.json()
			loading = false
			if (response.ok && data) {
				fetchModules()
				fetchStorage()
			} else {
				error = data.errors?.name || 'Error detaching storage.'
			}
		} catch (error) {
			loading = false
			console.error('Error detaching storage:', error)
		}
	}

	function handleEdit(id) {
		isEditing = true
		showForm = true
		editingID = id
		containers.map(container => {
			if (container.id === id) {
				storageName = container.name
				storageDescription = container.description
			}
		})
	}

	onMount(() => {
		fetchModules()
		fetchStorage()
	})

	// Computed property to filter variables based on searchTerm
	let filteredContainers = $derived(
		containers.filter(variable => variable.name.toLowerCase().includes(searchTerm.toLowerCase()))
	)

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
		storageModal.update(value => !value)
	}
</script>

<ToolWindow
	initialSize={{ width: 26 * 16, height: 529 }}
	initialPosition={{ x: 23, y: 7 * 3 }}
	boundsRef={get(mainAreaRef)}
	headerIcon={modal_title_icon}
	inScale={{ start: 0.9, duration: 200 }}
	outFade={{ duration: 150 }}
	headerText="Storage"
	{toggleModal}
>
	<!-- Modal Header -->
	<div class="flex items-center w-full p-4 gap-y-5">
		<div class="relative w-full">
			<input
				id="search"
				type="text"
				placeholder="Search Anything..."
				class="w-full px-4 py-3 text-xs border rounded-md bg-website-secondary border-brand-primary-gray"
				bind:value={searchTerm}
			/>
			<img src={search_icon} alt="search_icon" class="absolute inset-y-0 w-5 right-3 top-3" />
		</div>
	</div>
	{#if showForm}
		<div class="flex flex-col px-5 py-4 overflow-y-auto grow gap-y-4 bg-website-primary">
			<input
				type="text"
				bind:value={storageName}
				placeholder="Storage Name"
				class="w-full p-2 text-white bg-transparent border rounded-md border-brand-primary-gray"
			/>
			<textarea
				bind:value={storageDescription}
				placeholder="Storage Description"
				class="w-full p-2 text-white bg-transparent border rounded-md min-h-12 max-h-36 border-brand-primary-gray"
			></textarea>
			{#if error}
				<p class="mt-auto text-sm text-center text-red-500">{error}</p>
			{/if}
		</div>
		<div
			class="flex items-center justify-end px-6 py-3 border-t gap-x-5 bg-website-primary border-brand-primary-gray"
		>
			<Button content={{ width: 'fit', text: 'Cancel' }} on:click={closeForm} />
			<Button
				content={{ width: 'fit', text: isEditing ? 'Update' : 'Create' }}
				on:click={() => (isEditing ? updateStorage() : createStorage())}
			/>
		</div>
	{:else if loading}
		<div class="flex items-center justify-center grow">
			<Spinner />
		</div>
	{:else}
		<div class="overflow-y-auto grow bg-website-primary">
			{#if !loading && containers.length === 0}
				<div class="flex items-center justify-center h-full">
					<p class="text-white">No Storage Created</p>
				</div>
			{/if}
			{#each filteredContainers as category, i}
				<div
					class={`py-2 px-5 group flex items-center justify-between w-full duration-200 ease-in-out hover:bg-website-tertiary border-y border-y-brand-primary-gray`}
				>
					<button class="flex flex-col w-full py-2">
						<h3 class="my-0.5 font-bold text-white text-md">{category.name}</h3>
						<div class="flex items-center my-0.5 gap-x-3 text-brand-light-gray">
							<h3 class="text-xs">{format(new Date(category.created_at), 'dd-MM-yyyy')}</h3>
							<p>|</p>
							<h3 class="text-xs">{category.id}</h3>
						</div>
						{#if category.access_point}
							<p class="text-sm text-primary-green">Active</p>
						{:else}
							<p class="text-sm text-blue-300 animate-pulse">Provisioning...</p>
						{/if}
					</button>
					{#if edit_delete_modal && activeIndex === i}
						<DeleteEditModal
							on:click={e => e.stopPropagation()}
							on:edit={() => handleEdit(category.id)}
							on:delete={() => deleteStorage(category.id)}
						/>
					{/if}
					{#if category.access_point && category.module_attached}
						<div class="flex items-center gap-x-2">
							<select
								class="px-2 py-2 text-xs transition duration-200 ease-in-out bg-transparent border rounded-lg border-brand-primary-gray hover:border-brand-light-gray"
								bind:value={selectedAttachedModuleIDs[category.id]}
								onchange={() => {
									selectedAttachedModuleIDs[category.id] = event.target.value
								}}
							>
								<!-- <option value="">Select Module</option> -->
								{#each category.modules as module}
									<option value={module.id}>{module.name}</option>
								{/each}
							</select>
							<button
								onclick={() => detachStorage(category.id, selectedAttachedModuleIDs[category.id])}
								class="px-3 py-2 text-xs text-red-100 transition duration-200 ease-in-out border border-red-900 rounded-lg bg-red-950 hover:border-red-600"
							>
								Detach
							</button>
						</div>
					{:else if category.access_point}
						<div class="flex items-center gap-x-2">
							<select
								class="px-2 py-2 text-xs transition duration-200 ease-in-out bg-transparent border rounded-lg border-brand-primary-gray hover:border-brand-light-gray"
								bind:value={selectedModuleIDs[category.id]}
								onchange={() => {
									selectedModuleIDs[category.id] = event.target.value
								}}
							>
								<option value="">Select Module</option>
								{#each modules as module}
									<option value={module.id}>{module.name}</option>
								{/each}
							</select>
							<button
								onclick={() => attachStorage(category.id, selectedModuleIDs[category.id])}
								class="px-3 py-2 text-xs transition duration-200 ease-in-out border rounded-lg border-brand-primary-gray hover:border-brand-light-gray"
							>
								Attach
							</button>
						</div>
					{/if}
					<button
						type="button"
						class="flex-shrink-0 w-5 cursor-pointer"
						onclick={e => {
							e.stopPropagation()
							toggleEditDeleteModal(i)
						}}
					>
						<img src={dots} alt="dots" class="ml-2" />
					</button>
				</div>
			{/each}
		</div>
		<!-- Modal Footer -->
		<div class="flex items-center justify-center p-3 bg-website-primary">
			<Button content={{ width: 'full', icon: Add, text: 'New Storage' }} on:click={ToggleForm} />
		</div>
	{/if}
</ToolWindow>
