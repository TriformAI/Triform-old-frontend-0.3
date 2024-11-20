<script>
	import { fade, scale } from 'svelte/transition';

	import comment from '$lib/icons/comment.svg';
	import cross from '$lib/icons/cross.svg';
	import warning from '$lib/icons/warning.svg';
</script>

<div
	class="absolute right-0 z-50 mt-2 border shadow-lg w-96 bg-website-secondary text-brand-white border-brand-primary-gray rounded-2xl"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<div>
		<h3 class="px-6 py-5 text-md font-semibold text-left border-b border-brand-primary-gray">Notifications</h3>
		<ul class="text-sm bg-website-primary rounded-b-2xl">
			<li
				class="flex items-baseline justify-between border-b p-7 border-b-brand-primary-gray hover:bg-white/5"
			>
				<div class="flex items-baseline text-left gap-x-3">
					<!-- Placeholder for Status Icon -->
					<img src={comment} alt="comment" class="relative w-6 top-1" />
					<div>
						<h4 class="font-bold">System Status Notification</h4>
						<p class="text-sm text-brand-light-gray">
							Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
						</p>
					</div>
				</div>
				<span class="flex-shrink-0 text-xs text-brand-light-gray">2h ago</span>
			</li>
			<li
				class="flex items-start justify-between border-b p-7 border-b-brand-primary-gray hover:bg-white/5"
			>
				<div class="flex items-start text-left gap-x-3">
					<!-- Placeholder for Error Icon -->
					<img src={cross} alt="cross" class="relative w-7 top-1" />

					<div>
						<h4 class="font-bold">Error Notification</h4>
						<p class="text-sm text-brand-light-gray">
							Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
						</p>
					</div>
				</div>
				<span class="flex-shrink-0 text-xs text-brand-light-gray">2h ago</span>
			</li>
			<li class="flex items-start justify-between p-7 hover:bg-white/5 rounded-b-2xl">
				<div class="flex items-start text-left gap-x-3">
					<!-- Placeholder for Performance Issue Icon -->
					<img src={warning} alt="warning" class="relative w-7 top-1" />

					<div>
						<h4 class="font-bold">Performance Issue Notification</h4>
						<p class="text-sm text-brand-light-gray">
							Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
						</p>
					</div>
				</div>
				<span class="flex-shrink-0 text-xs text-brand-light-gray">2h ago</span>
			</li>
		</ul>
	</div>
</div>
