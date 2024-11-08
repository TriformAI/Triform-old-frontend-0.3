<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import search_icon from '$lib/icons/search.svg';
	import unpined from '$lib/icons/unpined.svg';
	import pined from '$lib/icons/pined.svg';
	import filter from '$lib/icons/filter.svg';
	import Button from '$lib/components/Button.svelte';
	import Add from '$lib/icons/add.svg';
	import folder_icon from '$lib/icons/folder.svg';
	import new_folder from '$lib/icons/new_folder.svg';
	import dots from '$lib/icons/dots.svg';
	import DeleteEditModal from './DeleteEditModal.svelte';
	import { onMount } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { getAuthToken } from '$lib/stores/cookie';
	import Spinner from '../Spinner.svelte';
	import Agents from '$lib/icons/Actions.svg';
	import Actions from '$lib/icons/Agent.svg';
	import { componentToolsBoxModal, createModuleModal } from '$lib/stores/modals';

	let apiUrl = PUBLIC_API_URL;
	let authToken = getAuthToken();

	let searchTerm = $state('');
	let pined_unpined = $state(false);
	let folders = $state([]);

	let filteredFolders = $derived(
		folders.filter((folder) => folder.name.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	let showFolderForm = $state(false);
	let isEditing = false;
	let editFolderId = null;
	let folderForm = { name: '' };
	let nameInput; // For auto-focus
	let error = $state('');
	let loading = $state(false);

	let edit_delete_modal = $state(false);
	let activeIndex = $state(null);

	let actions = $state([
		{
			name: 'Action A',
			tags: ['Tag A', 'Tag B', 'Tag C']
		},
		{
			name: 'Action B',
			tags: ['Tag A', 'Tag B', 'Tag C']
		},
		{
			name: 'Action A',
			tags: ['Tag A', 'Tag B', 'Tag C']
		}
	]);

	let agents = $state([
		{
			name: 'Agent A',
			tags: ['Tag A', 'Tag B', 'Tag C']
		},
		{
			name: 'Agent B',
			tags: ['Tag A', 'Tag B', 'Tag C']
		},
		{
			name: 'Agent A',
			tags: ['Tag A', 'Tag B', 'Tag C']
		}
	]);

	// Variable to keep track of the active tab
	let activeTab = $state('action');

	// Function to set the active tab
	function setActiveTab(tab) {
		activeTab = tab;
	}

	onMount(() => {
		fetchFolders();
	});

	function togglePined() {
		pined_unpined = !pined_unpined;
	}

	// Fetch all folders
	async function fetchFolders() {
		try {
			loading = true;
			const response = await fetch(`${apiUrl}/api/v1/folders`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			});
			const data = await response.json();
			loading = false;
			folders = data.data.map((item) => ({
				id: item.id,
				name: item.name,
				type: item.type,
				created_at: item.created_at
			}));
		} catch (error) {
			loading = false;
			console.error('Error fetching folders:', error);
		}
	}

	// Save (Create or Update) folder
	async function saveFolder() {
		const { name } = folderForm;

		try {
			const url = isEditing
				? `${apiUrl}/api/v1/folders/${editFolderId}`
				: `${apiUrl}/api/v1/folders`;
			const method = isEditing ? 'PATCH' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify({ name, type: activeTab })
			});

			const data = await response.json();
			if (response.ok) {
				await fetchFolders(); // Refresh folders after saving
				closeForm();
				error = ''; // Clear any previous error
			} else {
				error = data.errors.name || data.errors || '';
				console.error('Error:', error);
			}
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
			console.error('Error saving folder:', err);
		}
	}

	// Delete a folder by ID
	async function handleDelete(id) {
		try {
			const response = await fetch(`${apiUrl}/api/v1/folders/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			});

			const data = await response.json();

			console.log(data);

			if (response.ok) {
				folders = folders.filter((folder) => folder.id !== id); // Remove from local state
				error = ''; // Clear any previous error
			} else {
				console.error('Error deleting folder');
			}
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
			console.error('Error deleting folder:', err);
		}
	}

	// Edit a folder
	function handleEdit(id) {
		const folder = folders.find((f) => f.id === id);
		if (folder) {
			isEditing = true;
			editFolderId = id;
			folderForm = { name: folder.name };
			showFolderForm = true;

			setTimeout(() => nameInput.focus(), 0);
		}
	}

	// Open form for creating a new folder
	function openAddFolderForm() {
		isEditing = false;
		editFolderId = null;
		folderForm = { name: '' };
		showFolderForm = true;
		error = '';

		setTimeout(() => nameInput.focus(), 0);
	}

	// Close the form and reset state
	function closeForm() {
		showFolderForm = false;
		isEditing = false;
		editFolderId = null;
		folderForm = { name: '' };
		error = '';
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
	href="#component-toolbox-modal"
	class="absolute left-8 top-40 mt-2 w-[27rem] bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
	onclick={() => (edit_delete_modal = false)}
>
	<!-- Search Modal Header -->
	<div class="flex flex-col px-4 py-4 border-b gap-y-5 border-brand-primary-gray">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="text-xl font-semibold text-left text-white">Components Toolbox</h3>
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
		<div class="flex items-center w-full my-3 text-sm gap-x-5">
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'action'}
				onclick={() => setActiveTab('action')}
			>
				Actions
			</button>
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'agent'}
				onclick={() => setActiveTab('agent')}
			>
				Agents
			</button>
		</div>
		<div class="flex items-center w-full">
			<div class="relative w-full">
				<input
					id="search"
					type="text"
					placeholder="Search Anything..."
					class="w-full px-4 py-2 text-lg border rounded-md bg-website-secondary border-brand-primary-gray"
					bind:value={searchTerm}
				/>
				<img src={search_icon} alt="search_icon" class="absolute inset-y-0 w-6 right-3 top-3" />
			</div>

			<button
				class="p-3 ml-2 cursor-pointer hover:bg-website-tertiary rounded-xl"
				onclick={openAddFolderForm}
			>
				<img src={new_folder} alt="new_folder" class="w-8" />
			</button>
		</div>
	</div>

	<!-- Add/Edit Folder Form -->
	{#if showFolderForm}
		<div class="h-[20rem] flex flex-col p-4 gap-y-4 bg-website-primary">
			<input
				type="text"
				bind:this={nameInput}
				bind:value={folderForm.name}
				placeholder="Folder Name"
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
				on:click={saveFolder}
			/>
		</div>
	{:else if loading}
		<div class="h-[20rem] p-4 flex items-center justify-center">
			<Spinner />
		</div>
	{:else}
		<div class="overflow-y-auto h-[25rem] py-3 bg-website-primary">
			{#each filteredFolders as folder, i}
				{#if folder.type === activeTab}
					<div
						class="flex items-center justify-between w-full duration-200 ease-in-out group hover:bg-website-tertiary"
					>
						<button class="flex items-center w-full px-6 py-3">
							<img src={folder_icon} alt="folder" class="w-6 mr-4" />
							<h1 class="truncate w-[13rem] text-left">{folder.name}</h1>
						</button>
						{#if edit_delete_modal && activeIndex === i}
							<DeleteEditModal
								on:click={(e) => e.stopPropagation()}
								on:edit={() => handleEdit(folder.id)}
								on:delete={() => handleDelete(folder.id)}
							/>
						{/if}
						<div class="items-center hidden mr-3 group-hover:flex gap-x-4">
							<button
								type="button"
								class="w-5 cursor-pointer"
								onclick={(e) => {
									e.stopPropagation();
									toggleEditDeleteModal(i);
								}}
							>
								<img src={dots} alt="dots" class="w-6" />
							</button>
						</div>
					</div>
				{/if}
			{/each}
			{#if activeTab == 'action'}
				<div>
					{#each actions as action}
						<div class="flex items-center w-full px-4 py-3 my-2 hover:bg-website-tertiary">
							<img src={Actions} alt="actions" class="mr-1" />
							<div>
								<h1>{action.name}</h1>
								<p class="text-xs text-brand-light-gray">Category</p>
							</div>
							<div class="flex items-center gap-2 ml-auto">
								{#each action.tags as tag}
									<span
										class="px-2 py-1 text-xs border rounded-md cursor-pointer text-brand-light-gray bg-website-secondary border-white/10 hover:border-white/30"
										>{tag}</span
									>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{:else if activeTab == 'agent'}
				<div>
					{#each agents as agent}
						<div class="flex items-center w-full px-4 py-3 my-2 hover:bg-website-tertiary">
							<img src={Agents} alt="agents" class="w-10 mr-2" />
							<div>
								<h1>{agent.name}</h1>
								<p class="text-xs text-brand-light-gray">Category</p>
							</div>
							<div class="flex items-center gap-2 ml-auto">
								{#each agent.tags as tag}
									<span
										class="px-2 py-1 text-xs border rounded-md cursor-pointer text-brand-light-gray bg-website-secondary border-white/10 hover:border-white/30"
										>{tag}</span
									>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Modal Footer -->
	<div
		class="flex items-center justify-center px-6 py-3 border-t gap-x-5 bg-website-primary border-brand-primary-gray"
	>
		{#if activeTab === 'action'}
			<Button
				content={{ width: 'full', icon: Add, text: 'New Action' }}
				on:click={() => {
					componentToolsBoxModal.update((value) => false);
					createModuleModal.update((value) => true);
				}}
			/>
		{:else if activeTab === 'agent'}
			<Button content={{ width: 'full', icon: Add, text: 'New Agent' }} />
		{/if}
	</div>
</a>
