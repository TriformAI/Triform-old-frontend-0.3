<script lang="ts">
	import Button from '../atoms/Button.svelte'
	import HighlightableTextarea from '../atoms/HighlightableTextarea.svelte'
	import Marquee from '../atoms/Marquee.svelte'
	import { generateProjectMeta, createProject } from '$lib/actions/project'
	import { toast } from 'svelte-sonner'
	import type * as z from 'zod'
	import { projectModel } from '$lib/schemas'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { sessionStore } from '$lib/stores/session.svelte'

	let textarea = $state<HTMLTextAreaElement>()
	let value = $state('')

	const samplePrompts = [
		{
			label: 'Customer support bot',
			prompt:
				'Build a tool that answers customer support queries based on our website content using a web tool'
		},
		{
			label: 'Blog post writer',
			prompt: 'Build a tool that researches and writes a blog post about a given topic'
		},
		{
			label: 'Swedish news analyst',
			prompt:
				'Build a tool that scrapes the latest news from the top Swedish news sites in parallel, analyzes the content and creates a concise summary'
		},
		{
			label: 'Automatic Newsletter',
			prompt:
				'Build a tool that fetches the latest AI news from public sources and creates a formatted newsletter with summaries and source links'
		},
		{
			label: 'SEO Analyst',
			prompt: 'Build a tool that scrapes a website and provides SEO recommendations for each page'
		},
		{
			label: 'Documentation writer',
			prompt:
				'Build a tool that analyzes a webpage and generates complete documentation for all its functionality'
		},
		{
			label: 'Lead Generator',
			prompt:
				'Build a tool that researches companies using public sources and generates a structured report with company details and employee lists'
		},
		{
			label: 'Lead Research',
			prompt:
				'Build a tool that researches board members and executives using public sources and provides personality profiles with communication recommendations'
		}
	]

	const onSampleSelect = (prompt: (typeof samplePrompts)[number]) => (value = prompt.prompt)

	let isLoading = $state(false)
	const sendPrompt = async () => {
		if (!value.trim().length) return toast.error('Please enter a prompt')

		isLoading = true

		const { success: metaSuccess, data: meta } = await generateProjectMeta(value)
		if (!metaSuccess) {
			isLoading = false
			return toast.error('Failed to generate project meta')
		}

		const { success: projectSuccess, data: project } = await createProject({
			resource: 'project/v1',
			meta: {
				name: meta.name,
				intention: ''
			},
			spec: {
				nodes: {},
				modifiers: {},
				readme: meta.readme,
				environment: {
					variables: []
				},
				triggers: {
					endpoints: {
						enabled: false,
						nodes: {},
						ingress_tokens: []
					},
					chat: {
						enabled: false
					}
				}
			}
		} satisfies z.infer<typeof projectModel>)

		if (!projectSuccess) {
			isLoading = false
			return toast.error('Failed creating new proejct')
		}

		goto(`/project/${project.id}`, {
			state: {
				initPrompt: value
			}
		})
	}

	onMount(() => {
		// if they're logged in and the __tf-init-prompt cookie is set, send the prompt
		if (!browser || !sessionStore.isAuthenticated) return
		let initPrompt = document.cookie
			.split('; ')
			.find(row => row.startsWith('__tf-init-prompt='))
			?.split('=')[1]
		if (!initPrompt) return
		initPrompt = decodeURIComponent(initPrompt)
		// reset the cookie so we don't get duplicates
		document.cookie = '__tf-init-prompt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
		value = initPrompt
		sendPrompt()
	})
</script>

<div class="flex w-full max-w-2xl flex-col items-center gap-3">
	<div
		class="bg-main-850 border-main-800 flex h-32 w-full flex-col items-end rounded-md border px-3 py-2"
	>
		<HighlightableTextarea
			bind:textarea
			bind:value
			class="h-full w-full"
			placeholder="Build a tool that..."
			onkeydown={e => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault()
					sendPrompt()
				}
			}}
		/>
		<Button
			variation="vibrant"
			disabled={!value.trim().length}
			type="submit"
			class="px-2 py-1"
			{isLoading}
			onClick={sendPrompt}
		>
			<div class="flex items-center gap-0.5">
				Create
				<kbd>↵</kbd>
			</div>
		</Button>
	</div>
	<Marquee speed={85} gap={8} pauseOnHover={true} class="max-w-[80vw]">
		{#each samplePrompts as prompt}
			<Button
				variation="vibrant"
				class="bg-main-850 text-main-400 border-main-800 hover:text-main-100 rounded-full py-1 whitespace-nowrap not-hover:inset-shadow-none"
				onClick={() => onSampleSelect(prompt)}
			>
				{prompt.label}
			</Button>
		{/each}
	</Marquee>
</div>
