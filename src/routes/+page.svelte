<script>
	import { onMount } from 'svelte';
	import './welcome.css';
	import logo from '$lib/images/Logo.svg';
	import python_logo from '$lib/images/Python.svg';
	import serverless_logo from '$lib/images/Serverless.svg';
	import security_logo from '$lib/images/Security.svg';
	import homepage_vid from '$lib/videos/Homepage.mp4';
	import firstblockgradient from '$lib/images/firstblockgradientbelow.svg';
</script>

<section class="bg-[#030712] welcome z-[-1]">
	<nav
		class="flex items-center justify-between w-full px-3 mx-auto py-7 sm:p-10 max-w-7xl lg:justify-around"
	>
		<ul class="lg:flex hidden items-center gap-x-10 text-[#D1D5DB] mr-auto">
			<a href=" " class="cursor-pointer hover:text-white">Features</a>
			<a href=" " class="cursor-pointer hover:text-white">Pricing</a>
			<a href=" " class="cursor-pointer hover:text-white">How it works</a>
		</ul>
		<img alt="triform logo" src={logo} class="relative w-14 right-7" />
		<div id="burger" class="z-50 w-10 h-10 ml-auto cursor-pointer lg:hidden">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-10 h-10 text-white"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
				/>
			</svg>
		</div>
		<div class="items-center hidden ml-auto text-white lg:flex lg:gap-x-10">
			<a href="/login" class="font-bold cursor-pointer hover:text-gray-400"><button>Login</button></a>
			<a href="/register">
				<div class="btn btn1">
					<div class="inner"></div>
					<button class="text-lg">Get Started</button>
				</div>
			</a>
		</div>

		<div
			id="mobileMenu"
			class="fixed inset-0 z-50 flex-col items-center justify-center hidden bg-black bg-opacity-75 backdrop-blur-sm"
		>
			<div class="flex items-center justify-between w-full p-5">
				<img alt="The project logo" src={logo} class="w-14" />
				<div id="cross" class="hidden w-10 h-10 ml-auto cursor-pointer lg:hidden z-60">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-10 h-10 text-white"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</div>
			</div>

			<div class="flex flex-col items-center justify-around w-full h-full mx-auto">
				<div class="relative flex flex-col items-center justify-center text-xl gap-y-10 top-20">
					<a href=" " class="text-white">Features</a>
					<a href=" " class="text-white">Pricing</a>
					<a href=" " class="text-white">How it works</a>
				</div>
				<div class="flex items-center justify-center mx-5 text-xl gap-x-10">
					<a href="/login" class="text-white">Login</a>
					<a href="/register" class=" Navbtn Navbtn1">
						<div class="inner"></div>
						<button class="text-white">Get Started</button>
					</a>
				</div>
			</div>
		</div>
	</nav>

	<!-- first block -->
	<div id="welcome" class="w-full mx-auto">
		<div class="relative flex items-center justify-center w-full top-2">
			<div
				class="hidden rotate-[20deg] lg:block absolute top-0 left-0 right-32 blur-3xl opacity-20 firstBlockGradientCircleTopLeft"
			></div>
			<div
				class="w-full mx-auto my-5 text-4xl leading-tight text-center lg:relative lg:text-6xl lg:flex-shrink-0 left-[15rem] lg:bottom-36 lg:leading-snug"
			>
				<h1 class="w-full title-gradient lg:relative">Build Your Python AI Integrations</h1>
				<h1 class=" gradient-text">in 5 Minutes</h1>
			</div>
			<img
				src={firstblockgradient}
				alt="firstblockgradient"
				class="relative hidden lg:block right-64 top-52"
			/>
		</div>
		<div
			class=" flex flex-col items-center justify-center lg:relative 2xl:bottom-[370px] bottom-[350px]"
		>
			<a href="/register">
				<div class="btn btn1">
					<div class="inner"></div>
					<button class="text-lg">Get Started</button>
				</div>
			</a>
			<video
				class="max-w-5xl mt-14 relative top-4 lg:w-[65%] w-[95%] rounded-xl border-t-[0.25px] border-l-[0.25px] border-gray-600"
				autoplay
				loop
				muted
			>
				<source src={homepage_vid} />
			</video>
		</div>
		<div
			class="mx-auto lg:relative lg:block hidden opacity-15 blur-2xl belowWelcomeImggradient left-24 bottom-[20rem]"
		></div>
		<div
			class="flex flex-col items-baseline justify-center w-full py-5 lg:relative lg:flex-row top-shadow bottom-[27rem] border-top-gradient"
		>
			<div
				class="space-y-4 lg:p-10 p-7 lg:max-w-[350px] w-full lg:border-r-[0.20px] lg:border-r-gray-900"
			>
				<div class="flex items-center gap-2 text-lg">
					<img src={serverless_logo} alt="serverless" />
					<h3 class="text-xl font-semibold text-white">Serverless architecture</h3>
				</div>
				<p class="text-[#a0a4a9] text-md font-thin">
					Experience unmatched scalability and reduced overhead with our serverless architecture.
					And scale to 0 when unused. Enabling you to focus solely on developing your applications.
				</p>
			</div>
			<div
				class="space-y-4 lg:p-10 p-7 lg:max-w-[350px] w-full lg:border-r-[0.20px] lg:border-r-gray-900"
			>
				<div class="flex items-center gap-x-2">
					<img src={python_logo} alt="python_integration" />
					<h3 class="text-xl font-semibold text-white">Python Integration</h3>
				</div>
				<p class="text-[#a0a4a9] text-md font-thin">
					Utilize your favourite Python frameworks and libraries to enhance your applications,
					streamlining the development process and accelerating deployment.
				</p>
			</div>
			<div class="w-full lg:p-10 p-7 py-10 space-y-4 lg:max-w-[350px]">
				<div class="flex items-center gap-2">
					<img src={security_logo} alt="security" />
					<h3 class="text-xl font-semibold text-white">Security</h3>
				</div>
				<p class="text-[#a0a4a9] text-md font-thin">
					Security is paramount. Our platform employs advanced encryption, authentication, and
					compliance measures to safeguard your applications.
				</p>
			</div>
		</div>
	</div>
</section>
