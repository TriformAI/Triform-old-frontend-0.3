<script lang="ts">
	import data from '$lib/chat-mock.json'
	import ChatItem from './ChatItem.svelte'

	import { parseChatData, chat } from './chatStore.svelte'

	parseChatData(data)
</script>

<div
	class="bg-main-950/60 border-main-800 row-span-3 grid grid-rows-[1fr_auto] rounded-lg border p-4"
>
	<div class="overflow-y-auto">
		<ul class="chat grid gap-4 text-sm">
			{#each chat.data as item}
				<li>
					<ChatItem {item} />
				</li>
			{/each}
		</ul>
	</div>

	<div class="leading-none">
		<textarea class="input-text" rows="3" placeholder="Talk to your project"></textarea>
	</div>
</div>
