<script>
	import logo from '../images/Logo.svg';
	import { page } from '$app/stores';

	$: currentPath = $page.url.pathname;

	let menu = true; // Example state to control sidebar open/close
</script>

<div
	class={` top-0 left-0 z-10 h-screen bg-gray-900 border-r border-white/5 ${menu ? 'lg:w-80 w-[5rem]' : 'w-12'}`}
>
	<div
		class={`flex flex-col h-screen pb-4 overflow-hidden overflow-y-auto bg-black/10 grow gap-y-5 ${menu ? 'lg:px-6 px-2' : 'px-2'}`}
	>
		<!-- Logo or Application Mark -->
		<a href="/dashboard" class="flex items-center h-16 m-1 shrink-0 w-fit">
			<!-- Replace with your logo/image -->
			<img alt="triform logo" src={logo} class="relative w-8 lg:w-10 lg:left-0 left-2" />
		</a>

		<!-- Main Navigation -->
		<div class="flex flex-col justify-between flex-1">
			<nav class="flex flex-col">
				<ul role="list" class="flex flex-col flex-1 gap-y-7">
					<li class={menu ? 'mx-2' : 'px-3'}>
						<ul role="list" class="lg:-mx-4 -mx-1 space-y-2 text-[#9CA3AF] text-sm font-semibold">
							<!-- Dashboard Link -->
							<a
								href="/dashboard"
								class={`flex items-center p-4 rounded-2xl duration-100 ease-linear hover:bg-[#171F2D]  group ${currentPath === '/dashboard' && 'bg-[#171F2D]'}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									class={`size-6 group-hover:stroke-white duration-100 ease-linear ${currentPath === '/dashboard' ? 'stroke-white' : 'stroke-gray-500'}`}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
									/>
								</svg>

								<span
									class={`lg:block  hidden ml-4 group-hover:text-white duration-100 ease-linear ${currentPath === '/dashboard' ? ' text-white' : 'text-gray-500'}`}
								>
									Dashboard
								</span>
							</a>

							<!-- Playground Link -->
							<a
								href="/playground"
								class={`flex items-center p-4 rounded-2xl duration-100 ease-linear hover:bg-[#171F2D] group ${currentPath === '/playground' && 'bg-[#171F2D]'}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									class={`size-6 group-hover:stroke-white duration-100 ease-linear ${currentPath === '/playground' ? 'stroke-white' : 'stroke-gray-500'}`}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
									/>
								</svg>

								<span
									class={`lg:block hidden ml-4 group-hover:text-white duration-100 ease-linear ${currentPath === '/playground' ? ' text-white' : 'text-gray-500'}`}
								>
									Playground
								</span>
							</a>

							<!-- Modules Link -->
							<a
								href="/modules"
								class={`flex items-center p-4 rounded-2xl duration-100 ease-linear hover:bg-[#171F2D] group ${currentPath === '/modules' && 'bg-[#171F2D]'}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									class={`size-6 group-hover:stroke-white duration-100 ease-linear ${currentPath === '/modules' ? 'stroke-white' : 'stroke-gray-500'}`}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
									/>
								</svg>


									<span
										class={`lg:block hidden ml-4 group-hover:text-white duration-100 ease-linear ${currentPath === '/modules' ? ' text-white' : 'text-gray-500'}`}
									>
										Modules
									</span>
								
							</a>

							<!-- Flows Link -->
							<a
								href="/flows"
								class={`flex items-center p-4 rounded-2xl duration-100 ease-linear hover:bg-[#171F2D] group ${currentPath === '/flows' && 'bg-[#171F2D]'}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									class={`size-6 group-hover:stroke-white duration-100 ease-linear ${currentPath === '/flows' ? 'stroke-white' : 'stroke-gray-500'}`}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
									/>
								</svg>

							
									<span
										class={`lg:block hidden ml-4 group-hover:text-white duration-100 ease-linear ${currentPath === '/flows' ? ' text-white' : 'text-gray-500'}`}
									>
										Flows
									</span>
						
							</a>

							<!-- Environment Link -->
							<a
								href="/environment"
								class={`flex items-center p-4 rounded-2xl duration-100 ease-linear hover:bg-[#171F2D] group ${currentPath === '/environment' && 'bg-[#171F2D]'}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									class={`size-6 group-hover:stroke-white duration-100 ease-linear ${currentPath === '/environment' ? 'stroke-white' : 'stroke-gray-500'}`}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
									/>
								</svg>

							
									<span
										class={`lg:block hidden ml-4 group-hover:text-white duration-100 ease-linear ${currentPath === '/environment' ? ' text-white' : 'text-gray-500'}`}
									>
										Environment
									</span>
							
							</a>

							<!-- Template Library Link -->
							<a
								href="/library"
								class={`flex items-center p-4 rounded-2xl duration-100 ease-linear hover:bg-[#171F2D] group ${currentPath === '/library' && 'bg-[#171F2D]'}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									class={`size-6 group-hover:stroke-white duration-100 ease-linear ${currentPath === '/library' ? 'stroke-white' : 'stroke-gray-500'}`}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
									/>
								</svg>

							
									<span
										class={`lg:block hidden ml-4 group-hover:text-white duration-100 ease-linear ${currentPath === '/library' ? ' text-white' : 'text-gray-500'}`}
									>
										Template Library
									</span>
						
							</a>

							<!-- Storage Link -->
							<a
								href="/storage"
								class={`flex items-center p-4 rounded-2xl duration-100 ease-linear hover:bg-[#171F2D] group ${currentPath === '/storage' && 'bg-[#171F2D]'}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									class={`size-6 group-hover:stroke-white duration-100 ease-linear ${currentPath === '/storage' ? 'stroke-white' : 'stroke-gray-500'}`}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
									/>
								</svg>

									<span
										class={`lg:block hidden ml-4 group-hover:text-white duration-100 ease-linear ${currentPath === '/storage' ? ' text-white' : 'text-gray-500'}`}
									>
										Storage
									</span>
						
							</a>
						</ul>
					</li>
				</ul>
			</nav>

			<!-- Bottom Navigation (e.g. Billing, Support) -->
			<nav class="flex flex-col">
				<ul role="list" class="flex flex-col flex-1 mb-4 gap-y-7">
					<li class={menu ? 'mx-2' : 'px-4'}>
						<ul role="list" class="lg:-mx-4 -mx-1 space-y-2 text-[#9CA3AF] text-sm font-semibold">
							<a
								href="/billings"
								class={`flex items-center p-4 rounded-2xl duration-100 ease-linear hover:bg-[#171F2D] group ${currentPath === '/billings' && 'bg-[#171F2D]'}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									class={`size-6 group-hover:stroke-white duration-100 ease-linear ${currentPath === '/billings' ? 'stroke-white' : 'stroke-gray-500'}`}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
									/>
								</svg>

									<span
										class={`lg:block hidden ml-4 group-hover:text-white duration-100 ease-linear ${currentPath === '/billings' ? ' text-white' : 'text-gray-500'}`}
									>
										Billings
									</span>
						
							</a>

							<a
								href="https://support.triform.ai"
								class={`flex items-center p-4 rounded-2xl duration-100 ease-linear hover:bg-[#171F2D] group `}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									class={`size-6 group-hover:stroke-white duration-100 ease-linear stroke-gray-500`}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M16.712 4.33a9.027 9.027 0 0 1 1.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 0 0-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 0 1 0 9.424m-4.138-5.976a3.736 3.736 0 0 0-.88-1.388 3.737 3.737 0 0 0-1.388-.88m2.268 2.268a3.765 3.765 0 0 1 0 2.528m-2.268-4.796a3.765 3.765 0 0 0-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 0 1-1.388.88m2.268-2.268 4.138 3.448m0 0a9.027 9.027 0 0 1-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0-3.448-4.138m3.448 4.138a9.014 9.014 0 0 1-9.424 0m5.976-4.138a3.765 3.765 0 0 1-2.528 0m0 0a3.736 3.736 0 0 1-1.388-.88 3.737 3.737 0 0 1-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 0 1-1.652-1.306 9.027 9.027 0 0 1-1.306-1.652m0 0 4.138-3.448M4.33 16.712a9.014 9.014 0 0 1 0-9.424m4.138 5.976a3.765 3.765 0 0 1 0-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 0 1 1.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 0 0-1.652 1.306A9.025 9.025 0 0 0 4.33 7.288"
									/>
								</svg>

							
									<span
										class={`lg:block hidden ml-4 group-hover:text-white duration-100 ease-linear text-gray-500`}
									>
										Support
									</span>
							
							</a>
						</ul>
					</li>
				</ul>

				<!-- User Profile Dropdown (simplified) -->
				<div class={menu ? 'lg:-mx-0 mx-2' : 'px-3'}>
					<button
						class="flex items-center px-2 text-sm text-gray-500 rounded-full gap-x-4 hover:text-gray-300"
					>
						<div class="relative p-1 text-xs bg-white rounded-full text-blue lg:left-0 left-1">
							AN
						</div>
						
							<div class="hidden lg:block">
								<span class="truncate max-w-[8rem]">Team Name</span>
							</div>
					
					</button>
				</div>
			</nav>
		</div>
	</div>
</div>
