<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import search_icon from '$lib/icons/search.svg';
	import unpined from '$lib/icons/unpined.svg';
	import pined from '$lib/icons/pined.svg';
	import filter from '$lib/icons/filter.svg';
	import Button from '$lib/components/Button.svelte';
	import Add from '$lib/icons/add.svg';
	import Agents from '$lib/icons/Actions.svg';
	import Actions from '$lib/icons/Agent.svg';
	import new_folder from '$lib/icons/new_folder.svg';
	import folder from '$lib/icons/folder.svg';
	import { componentToolsBoxModal, createModuleModal } from '$lib/stores/modals';

	let searchTerm = $state('');
	let pined_unpined = $state(false);
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
		},
		{
			name: 'Action B',
			tags: ['Tag A', 'Tag B', 'Tag C']
		},
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
		},
		{
			name: 'Action B',
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
		},
		{
			name: 'Agent B',
			tags: ['Tag A', 'Tag B', 'Tag C']
		},
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
		},
		{
			name: 'Agent B',
			tags: ['Tag A', 'Tag B', 'Tag C']
		}
	]);

	// Variable to keep track of the active tab
	let activeTab = $state('Action');

	// Function to set the active tab
	function setActiveTab(tab) {
		activeTab = tab;
	}

	function togglePined() {
		pined_unpined = !pined_unpined;
	}
</script>

<div
	class="absolute left-8 top-40 mt-2 w-[27rem] bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
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
				class:border-b-2={activeTab === 'Action'}
				onclick={() => setActiveTab('Action')}
			>
				Actions
			</button>
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'Agents'}
				onclick={() => setActiveTab('Agents')}
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
			<div class="p-4 ml-5 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img src={filter} alt="filter" class="w-8" />
			</div>
			<div class="p-4 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img src={new_folder} alt="new_folder" class="w-8" />
			</div>
		</div>
	</div>

	<div class="overflow-y-auto h-[25rem] bg-website-primary">
		{#if activeTab == 'Action'}
			<div class="py-3">
				<div class="flex items-center w-full py-3 my-2 px-7 hover:bg-website-tertiary">
					<img src={folder} alt="folder" class="w-6 mr-4" />
					<div>
						<h1>Folder Name</h1>
						<p class="text-xs text-brand-light-gray">3 tools</p>
					</div>
				</div>
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
		{:else}
			<div class="py-3">
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
	<!-- Modal Footer -->
	<div
		class="flex items-center justify-center px-6 py-3 border-t gap-x-5 bg-website-primary border-brand-primary-gray"
	>
		{#if activeTab == 'Action'}
			<Button
				content={{ width: 'full', icon: Add, text: 'New Action' }}
				onclick={() => {
					componentToolsBoxModal.update((value) => false);
					createModuleModal.update((value) => true);
				}}
			/>
		{:else}
			<Button content={{ width: 'full', icon: Add, text: 'New Agent' }} />
		{/if}
	</div>
</div>
