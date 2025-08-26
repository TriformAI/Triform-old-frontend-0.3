<script lang="ts">
	import { twMerge } from 'tailwind-merge'

	const { class: classes = 'size-5' }: { class?: string } = $props()
</script>

<svg
	class={twMerge('animate-spin text-white', classes)}
	viewBox="0 0 166 166"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<g clip-path="url(#clip0_1_2)">
		<path
			d="M3 120.962L126 120.992L87.6127 54.2779L96.5078 38.8594L152.414 135.72L11.4894 135.667L3 120.962Z"
			fill="white"
		/>
		<path
			d="M89.0781 -6L28.1537 99.4922H106.145L114.804 114.492H3L71.0781 -6L89.0781 -6Z"
			fill="white"
		/>
		<path
			d="M159.786 135.484L96.5583 25.9818L57.6394 93.4922L39.08 93.4962L96.5219 -5.99522L169.004 119.543L159.786 135.484Z"
			fill="white"
		/>
	</g>
	<defs>
		<clipPath id="clip0_1_2">
			<rect width="166" height="166" fill="white" />
		</clipPath>
	</defs>
</svg>
