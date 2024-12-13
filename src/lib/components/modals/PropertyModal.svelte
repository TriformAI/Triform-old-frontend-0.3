<script>
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import { get } from 'svelte/store';
	import { mainAreaRef } from '$lib/stores/layoutRefs';
	import ToolWindow from '$lib/components/ToolWindow.svelte';

	let properties = $state([
		{
			name: 'Property Category A',
			collapsed: false
		},
		{
			name: 'Property Category B',
			collapsed: false
		}
	]);

	// Function to toggle the collapsed state
	function toggleCategory(index) {
		properties[index].collapsed = !properties[index].collapsed;
	}
</script>

<ToolWindow
	initialSize={{ width: 25 * 16, height: 532 }}
	boundsRef={get(mainAreaRef)}
	headerIcon={modal_title_icon}
	inScale={{ start: 0.9, duration: 200 }}
	outFade={{ duration: 150 }}
	headerText="Properties"
>
	<!-- Collapsible Category List -->
	<div class="grow py-3 overflow-y-auto h-[29rem] bg-website-primary">
		{#each properties as category, i}
			<div>
				<!-- Category Header -->
				<button
					class="flex items-center justify-between w-full px-6 pt-2 cursor-pointer"
					onclick={() => toggleCategory(i)}
				>
					<h3 class="my-1 font-bold text-white text-md">{category.name}</h3>
					{#if category.collapsed}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
							class="w-5 h-5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
							class="w-5 h-5 transform rotate-180"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
						</svg>
					{/if}
				</button>

				<!-- Child Items (Visible only if the category is not collapsed) -->
				{#if !category.collapsed}
					<div class="w-full">
						<div class="w-full px-6 py-4 duration-200 ease-in-out cursor-pointer group gap-x-3">
							<div class="w-full mb-4">
								<label for="Label" class="block mb-2 text-sm font-medium text-left">Label</label>
								<input
									id="Label"
									type="text"
									placeholder="Type here..."
									class="w-full px-4 py-2 text-sm border rounded-md bg-website-secondary border-brand-primary-gray"
								/>
							</div>
							<div class="w-full mb-4">
								<label for="Label" class="block mb-2 text-sm font-medium text-left">Label</label>
								<select
									id="Label"
									placeholder="Type here..."
									class="w-full px-4 py-2 text-sm border rounded-md bg-website-secondary border-brand-primary-gray"
								>
									<option>Option 1</option>
									<option>Option 2</option>
									<option>Option 3</option>
								</select>
							</div>
							<div class="text-left">
								<input
									type="checkbox"
									class="w-4 h-4 transition-all border rounded shadow appearance-none cursor-pointer hover:shadow-md border-brand-secondary-gray checked:bg-slate-50 checked:border-slate-800"
									id="check"
								/>
								<label for="check" class="relative ml-3 text-sm text-white bottom-1">Label</label>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</ToolWindow>
