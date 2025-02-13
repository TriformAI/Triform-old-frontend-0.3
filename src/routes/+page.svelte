<script>
	window.location.href = '/login'

	import './welcome.css'
	import logo from '$lib/images/Logo.svg'
	import python_logo from '$lib/images/Python.svg'
	import serverless_logo from '$lib/images/Serverless.svg'
	import security_logo from '$lib/images/Security.svg'
	import homepage_vid from '$lib/videos/Homepage.mp4'
	import firstblockgradient from '$lib/images/firstblockgradientbelow.svg'
</script>

<section class="welcome z-[-1] bg-[#030712]">
	<nav
		class="mx-auto flex w-full max-w-7xl items-center justify-between px-3 py-7 sm:p-10 lg:justify-around"
	>
		<ul class="text-brand-tertiary-gray mr-auto hidden items-center gap-x-10 lg:flex">
			<a href=" " class="cursor-pointer hover:text-white">Features</a>
			<a href=" " class="cursor-pointer hover:text-white">Pricing</a>
			<a href=" " class="cursor-pointer hover:text-white">How it works</a>
		</ul>
		<img alt="triform logo" src={logo} class="relative right-7 w-14" />
		<div id="burger" class="z-50 ml-auto h-10 w-10 cursor-pointer lg:hidden">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-10 w-10 text-white"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
				/>
			</svg>
		</div>
		<div class="ml-auto hidden items-center text-white lg:flex lg:gap-x-10">
			<a href="/login" class="cursor-pointer font-bold hover:text-gray-400"
				><button>Login</button></a
			>
			<a href="/register">
				<div class="btn btn1">
					<div class="inner"></div>
					<button class="text-sm">Get Started</button>
				</div>
			</a>
		</div>

		<div
			id="mobileMenu"
			class="bg-opacity-75 fixed inset-0 z-50 hidden flex-col items-center justify-center bg-black backdrop-blur-sm"
		>
			<div class="flex w-full items-center justify-between p-5">
				<img alt="The project logo" src={logo} class="w-14" />
				<div id="cross" class="z-60 ml-auto hidden h-10 w-10 cursor-pointer lg:hidden">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-10 w-10 text-white"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</div>
			</div>

			<div class="mx-auto flex h-full w-full flex-col items-center justify-around">
				<div class="text-md relative top-20 flex flex-col items-center justify-center gap-y-10">
					<a href="/" class="text-white">Features</a>
					<a href="/" class="text-white">Pricing</a>
					<a href="/" class="text-white">How it works</a>
				</div>

				<div class="text-md mx-5 flex items-center justify-center gap-x-10">
					<a href="/login" class="text-white">Login</a>
					<a href="/register" class="Navbtn Navbtn1">
						<div class="inner"></div>
						<button class="text-white">Get Started</button>
					</a>
				</div>
			</div>
		</div>
	</nav>

	<!-- first block -->
	<div id="welcome" class="mx-auto w-full">
		<div class="relative top-2 flex w-full items-center justify-center">
			<div
				class="firstBlockGradientCircleTopLeft absolute top-0 right-32 left-0 hidden rotate-[20deg] opacity-20 blur-3xl lg:block"
			></div>
			<div
				class="left-[15rem] mx-auto my-5 w-full text-center text-4xl leading-tight lg:relative lg:bottom-36 lg:flex-shrink-0 lg:text-6xl lg:leading-snug"
			>
				<h1 class="title-gradient w-full lg:relative">Build Your Python AI Integrations</h1>
				<h1 class=" gradient-text">in 5 Minutes</h1>
			</div>
			<img
				src={firstblockgradient}
				alt="firstblockgradient"
				class="relative top-52 right-64 hidden lg:block"
			/>
		</div>
		<div
			class=" bottom-[350px] flex flex-col items-center justify-center lg:relative 2xl:bottom-[370px]"
		>
			<a href="/register">
				<div class="btn btn1">
					<div class="inner"></div>
					<button class="text-sm">Get Started</button>
				</div>
			</a>
			<video
				class="relative top-4 mt-14 w-[95%] max-w-5xl rounded-xl border-t-[0.25px] border-l-[0.25px] border-gray-600 lg:w-[65%]"
				autoplay
				loop
				muted
			>
				<source src={homepage_vid} />
			</video>
		</div>
		<div
			class="belowWelcomeImggradient bottom-[20rem] left-24 mx-auto hidden opacity-15 blur-2xl lg:relative lg:block"
		></div>
		<div
			class="top-shadow border-top-gradient bottom-[27rem] flex w-full flex-col items-baseline justify-center py-5 lg:relative lg:flex-row"
		>
			<div
				class="w-full space-y-4 p-7 lg:max-w-[350px] lg:border-r-[0.20px] lg:border-r-gray-900 lg:p-10"
			>
				<div class="flex items-center gap-2 text-sm">
					<img src={serverless_logo} alt="serverless" />
					<h3 class="text-md font-semibold text-white">Serverless architecture</h3>
				</div>
				<p class="text-brand-light-gray text-md font-thin">
					Experience unmatched scalability and reduced overhead with our serverless architecture.
					And scale to 0 when unused. Enabling you to focus solely on developing your applications.
				</p>
			</div>
			<div
				class="w-full space-y-4 p-7 lg:max-w-[350px] lg:border-r-[0.20px] lg:border-r-gray-900 lg:p-10"
			>
				<div class="flex items-center gap-x-2">
					<img src={python_logo} alt="python_integration" />
					<h3 class="text-md font-semibold text-white">Python Integration</h3>
				</div>
				<p class="text-brand-light-gray text-md font-thin">
					Utilize your favourite Python frameworks and libraries to enhance your applications,
					streamlining the development process and accelerating deployment.
				</p>
			</div>
			<div class="w-full space-y-4 p-7 py-10 lg:max-w-[350px] lg:p-10">
				<div class="flex items-center gap-2">
					<img src={security_logo} alt="security" />
					<h3 class="text-md font-semibold text-white">Security</h3>
				</div>
				<p class="text-brand-light-gray text-md font-thin">
					Security is paramount. Our platform employs advanced encryption, authentication, and
					compliance measures to safeguard your applications.
				</p>
			</div>
		</div>
	</div>
</section>
