<script lang="ts">
	import { twMerge } from 'tailwind-merge'

	const { class: classes = 'size-5' }: { class?: string } = $props()
</script>

<svg
	class={twMerge('spinner-logo text-white opacity-90 saturate-0', classes)}
	viewBox="0 0 166 166"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<path
		d="M0 127.47L123 127.5L84.6127 60.7857L93.5078 45.3672L149.414 142.228L8.48943 142.175L0 127.47Z"
		fill="url(#paint0_linear_826_23229)"
	/>
	<path
		d="M0 127.47L123 127.5L84.6127 60.7857L93.5078 45.3672L149.414 142.228L8.48943 142.175L0 127.47Z"
		fill="url(#paint1_linear_826_23229)"
	/>
	<path
		d="M86.0781 0.507812L25.1537 106H103.145L111.804 121H0L68.0781 0.507812H86.0781Z"
		fill="url(#paint2_linear_826_23229)"
	/>
	<path
		d="M156.786 141.992L93.5583 32.4896L54.6394 100L36.08 100.004L93.5219 0.512589L166.004 126.051L156.786 141.992Z"
		fill="url(#paint3_linear_826_23229)"
	/>
	<defs>
		<linearGradient
			id="paint0_linear_826_23229"
			x1="5.84"
			y1="94.8901"
			x2="143.43"
			y2="96.9501"
			gradientUnits="userSpaceOnUse"
		>
			<stop stop-color="#71C9EC" />
			<stop offset="1" stop-color="#833FB4" />
		</linearGradient>
		<linearGradient
			id="paint1_linear_826_23229"
			x1="5.84"
			y1="94.8901"
			x2="143.43"
			y2="96.9501"
			gradientUnits="userSpaceOnUse"
		>
			<stop stop-color="#71C9EC" />
			<stop offset="1" stop-color="#833FB4" />
		</linearGradient>
		<linearGradient
			id="paint2_linear_826_23229"
			x1="109.87"
			y1="22.11"
			x2="47.1098"
			y2="137.28"
			gradientUnits="userSpaceOnUse"
		>
			<stop stop-color="#71C9EC" />
			<stop offset="1" stop-color="#833FB4" />
		</linearGradient>
		<linearGradient
			id="paint3_linear_826_23229"
			x1="123.686"
			y1="154.03"
			x2="59.5323"
			y2="33.711"
			gradientUnits="userSpaceOnUse"
		>
			<stop stop-color="#71C9EC" />
			<stop offset="1" stop-color="#833FB4" />
		</linearGradient>
	</defs>
</svg>

<style>
	@keyframes step-rotate {
		0% {
			transform: rotate(0deg);
		}
		33.33% {
			transform: rotate(120deg);
		}
		66.66% {
			transform: rotate(240deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.spinner-logo {
		transform-origin: center;
		animation: step-rotate 4s cubic-bezier(0.8, 0, 0.2, 1) infinite;
	}
</style>
