<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import unpined from '$lib/icons/unpined.svg';
	import pined from '$lib/icons/pined.svg';
	import Button from '$lib/components/Button.svelte';
	import Add from '$lib/icons/add.svg';
	import dots from '$lib/icons/dots.svg';
	import DeleteEditModal from './DeleteEditModal.svelte';
	import { onMount } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { getAuthToken } from '$lib/stores/cookie';
	import Spinner from '../Spinner.svelte';

	let apiUrl = PUBLIC_API_URL;
	let authToken = getAuthToken();

	let pined_unpined = $state(false);
	let edit_delete_modal = $state(false);
	let activeIndex = $state(null);
	let variables = $state([]);
	let showVariableForm = $state(false);
	let isEditing = false;
	let editVariableId = null;
	let variableForm = { name: '', value: '' };
	let nameInput; // Reference for auto-focus
	let error = $state(''); // Error message
	let loading = $state(false);

	onMount(() => {
		fetchEnvironmentVariables();
	});

	function togglePined() {
		pined_unpined = !pined_unpined;
	}

	// Fetch all environment variables from the server
	async function fetchEnvironmentVariables() {
		try {
			loading = true;
			const response = await fetch(`${apiUrl}/api/v1/environment/variables`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			});
			const data = await response.json();
			loading = false;
			variables = data.data.map((item) => ({
				id: item.id,
				key: item.name,
				value: item.value,
				visible: false
			}));
		} catch (error) {
			loading = false;
			console.error('Error fetching variables:', error);
		}
	}

	// Add or edit an environment variable
	async function saveVariable() {
		const { name, value } = variableForm;

		try {
			const url = isEditing
				? `${apiUrl}/api/v1/environment/variables/${editVariableId}`
				: `${apiUrl}/api/v1/environment/variables`;
			const method = isEditing ? 'PATCH' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify({ name, value })
			});

			const data = await response.json();
			if (response.ok) {
				await fetchEnvironmentVariables(); // Refresh variables after saving
				closeForm(); // Close form after saving
				error = ''; // Clear any previous error
			} else {
				error = data.errors.value || data.errors || '';
				console.error('Error:', error);
			}
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
			console.error('Error saving variable:', err);
		}
	}

	// Delete an environment variable by ID
	async function handleDelete(id) {
		try {
			const response = await fetch(`${apiUrl}/api/v1/environment/variables/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			});

			if (response.ok) {
				variables = variables.filter((variable) => variable.id !== id); // Remove from local state
				error = ''; // Clear any previous error
			} else {
				console.error('Error:', error);
			}
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
			console.error('Error deleting variable:', err);
		}
	}

	// Function to handle editing a variable
	function handleEdit(id) {
		const variable = variables.find((v) => v.id === id);
		if (variable) {
			isEditing = true;
			editVariableId = id;
			variableForm = { name: variable.key, value: variable.value };
			showVariableForm = true;

			// Auto-focus the name input
			setTimeout(() => nameInput.focus(), 0);
		}
	}

	// Function to open the add variable form
	function openAddVariableForm() {
		isEditing = false;
		editVariableId = null;
		variableForm = { name: '', value: '' };
		showVariableForm = true;
		error = ''; // Clear any previous error

		// Auto-focus the name input
		setTimeout(() => nameInput.focus(), 0);
	}

	// Close the form and reset state
	function closeForm() {
		showVariableForm = false;
		isEditing = false;
		editVariableId = null;
		variableForm = { name: '', value: '' };
		error = ''; // Clear any error message
	}

	// Toggle visibility of a specific variable
	function toggleVisibility(index) {
		variables = variables.map((variable, i) =>
			i === index ? { ...variable, visible: !variable.visible } : variable
		);
	}

	// Handle clicking outside of the DeleteEditModal
	function handleClickOutside(event) {
		if (edit_delete_modal && !event.target.closest('.delete-edit-modal')) {
			edit_delete_modal = false;
			activeIndex = null;
		}
	}

	// Toggle the Edit/Delete modal at the specific index
	function toggleEditDeleteModal(index) {
		if (activeIndex === index) {
			activeIndex = null;
			edit_delete_modal = false;
		} else {
			activeIndex = index;
			edit_delete_modal = true;
		}
	}
</script>

<a
	href="#environment-modal"
	class="absolute z-50 mt-2 border rounded-lg shadow-lg left-8 top-40 w-96 bg-website-secondary text-brand-tertiary-gray border-brand-primary-gray"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
	onclick={handleClickOutside}
>
	<!-- Modal Header -->
	<div class="flex flex-col px-4 py-4 border-b gap-y-5 border-brand-primary-gray">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="text-xl font-semibold text-left text-white">Environment Variables</h3>
			</div>
			{#if pined_unpined}
				<button type="button" class="w-6 cursor-pointer" onclick={togglePined} aria-label="Pin">
					<img src={pined} alt="pined" class="w-6" />
				</button>
			{:else}
				<button type="button" class="w-6 cursor-pointer" onclick={togglePined} aria-label="Unpin">
					<img src={unpined} alt="unpined" class="w-6" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Add/Edit Variable Form -->
	{#if showVariableForm}
		<div class="flex flex-col h-[40vh] p-4 overflow-y-auto gap-y-4 bg-website-primary">
			<input
				type="text"
				bind:this={nameInput}
				bind:value={variableForm.name}
				placeholder="Variable Name"
				class="w-full p-2 text-white bg-transparent border rounded-md border-brand-primary-gray"
			/>
			<input
				type="text"
				bind:value={variableForm.value}
				placeholder="Variable Value"
				class="w-full p-2 text-white bg-transparent border rounded-md border-brand-primary-gray"
			/>
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
				on:click={saveVariable}
			/>
		</div>
	{:else if loading}
		<div class="h-[40vh] p-4 flex items-center justify-center">
			<Spinner />
		</div>
	{:else}
		<!-- Collapsible Category List -->
		<div class="py-3 overflow-y-auto h-[40vh] bg-website-primary">
			{#if variables.length === 0}
				<div class="flex items-center justify-center h-full">
					<p class="text-white">No Environment Variables Created.</p>
				</div>
			{:else}
				{#each variables as category, i}
					<div
						class={`flex items-center justify-between w-full duration-200 ease-in-out group
				${activeIndex === i ? 'bg-website-tertiary' : `${!edit_delete_modal && 'hover:bg-website-tertiary'}`}`}
					>
						<button class="flex flex-col w-full px-6 py-3">
							<h3 class="my-1 truncate w-[15rem] text-left text-md">{category.key}</h3>
							{#if category.visible}
								<p class="w-[13rem] text-left truncate text-gray-400 font-bold text-sm">
									{category.value}
								</p>
							{:else}
								<p>*******</p>
							{/if}
						</button>
						<!-- Render the DeleteEditModal under the current item -->
						{#if edit_delete_modal && activeIndex === i}
							<DeleteEditModal
								on:click={(e) => e.stopPropagation()}
								on:edit={() => handleEdit(category.id)}
								on:delete={() => handleDelete(category.id)}
							/>
						{/if}
						<div
							class={`items-center hidden mr-3 duration-200 ease-in-out ${!edit_delete_modal && 'group-hover:flex'} gap-x-4`}
						>
							<button class="w-5" onclick={() => toggleVisibility(i)} aria-label="Toggle Value">
								{#if category.visible}
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
								onclick={(e) => {
									e.stopPropagation();
									toggleEditDeleteModal(i);
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
			<Button
				content={{ width: 'full', icon: Add, text: 'New Variable' }}
				on:click={openAddVariableForm}
			/>
		</div>
	{/if}
</a>
