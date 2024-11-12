<script>
	import { fade, scale } from 'svelte/transition';
	import { onMount } from 'svelte';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import CodeEditor from '../CodeEditor.svelte';
	import ReadMe from '../ReadMe.svelte';
	import Requirement from '../Requirement.svelte';
	let currentPath = '';
	let templateId = '';

	export let toggleModuleInfoModal;

	export let toggleTemplateModal;

	let templateID = '';

	// Function to get query parameters from URL
	function getQueryParams() {
		const urlParams = new URLSearchParams(window.location.search);
		templateID = urlParams.get('TID');
		//fetch details from the API
	}

	let TemplateDetails = [
		{
			code: `import os\r\nimport json\r\n\r\nfrom langchain_openai import ChatOpenAI  # Interface to OpenAI\'s Chat models.\r\nfrom langchain_core.prompts.chat import (\r\n    ChatPromptTemplate,  # For crafting chat-based prompts.\r\n    SystemMessagePromptTemplate,  # For creating system messages in chat prompts.\r\n)\r\n\r\nOPENAI_API_KEY = os.environ[\r\n    "OPENAI_API_KEY"\r\n]  # Securely fetch OpenAI API key from environment variables.\r\n\r\n\r\ndef handler(event, context):\r\n    # Extract the question and context from the event object.\r\n    question = event.get("question")\r\n    retrieved_context = event.get("retrieved_context")\r\n\r\n    # Validate presence of question and context.\r\n    if not question:\r\n        return {"error": "No question provided"}\r\n    if not retrieved_context:\r\n        return {"error": "No retrieved context provided"}\r\n\r\n    # Template for the chat where the model plays the role of an assistant using provided context.\r\n    template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don\'t know the answer, just say that you don\'t know. Use three sentences maximum and keep the answer concise.\r\n    Question: {question}\r\n    Context: {context}\r\n    Answer:\r\n    """\r\n    # Create a system message prompt from the predefined template.\r\n    system_message_prompt = SystemMessagePromptTemplate.from_template(template)\r\n\r\n    # Prepare the chat prompt with the system message.\r\n    chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt])\r\n\r\n    # Initialize the ChatOpenAI object with model specifications and API key.\r\n    llm = ChatOpenAI(\r\n        model_name="gpt-4-turbo-preview", temperature=0, openai_api_key=OPENAI_API_KEY\r\n    )\r\n\r\n    # Generate a chat completion using the prepared prompt, formatted with actual context and question.\r\n    response = llm.invoke(\r\n        chat_prompt.format_prompt(\r\n            context=retrieved_context, question=question\r\n        ).to_messages()\r\n    )\r\n\r\n    # Return the model\'s response as a JSON-formatted string.\r\n    return json.dumps({"output_0": response.content})`,
			created_at: '2024-04-22T16:31:07.000000Z',
			deleted_at: null,
			description:
				"This Python module integrates with OpenAI's Chat models to provide context-driven responses based on a given question and retrieved context. It utilizes templates to format prompts for the AI, enabling precise and relevant answers.",
			id: 0,
			name: 'Ask GPT',
			readme:
				'# Triform.ai Template: Contextual Chat Handler\r\n\r\n## Overview\r\n\r\nThis Python module integrates with OpenAI\'s Chat models to provide context-driven responses based on a given question and retrieved context. It utilizes templates to format prompts for the AI, enabling precise and relevant answers.\r\n\r\n## How it Works\r\n\r\nThe module extracts a question and its related context from event data, validates their presence, and formats them into a chat prompt using predefined templates. It then uses the `ChatOpenAI` interface to generate responses based on this context.\r\n\r\n## Use Cases\r\n\r\n- Automating customer support by providing responses that consider previous interactions or specific queries.\r\n- Enhancing virtual assistant functionalities to offer more context-aware responses in chatbots.\r\n- Implementing AI-driven tutoring systems where context from textbooks or lessons is used to answer student inquiries.\r\n\r\n## Customization\r\n\r\n- Modify the prompt templates to change the structure of the conversation or the type of responses.\r\n- Switch the OpenAI model (e.g., from "gpt-4-turbo-preview" to another model) to vary response styles or capabilities.\r\n- Adapt the module for different languages or domains by adjusting the chat templates and model settings.\r\n\r\n## Environment Setup\r\n\r\nSet the following environment variables in your Triform.ai environment:\r\n- `OPENAI_API_KEY`: API key for OpenAI authentication.',
			requirements: 'langchain\r\nlangchain-openai',
			tagsAssigned: 'Cohere, Anthropic, PGVector, LlamaIndex, Vectorize, RAG',
			updated_at: '2024-04-22T17:13:35.000000Z'
		}
	];


	onMount(() => {
		getQueryParams();
	});

	// Variable to keep track of the active tab
	let activeTab = 'Edit Action';

	// Function to set the active tab
	function setActiveTab(tab) {
		activeTab = tab;
	}
</script>

<!-- Background Overlay -->
<div class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"></div>

<div
	class="absolute w-[75rem] right-64 bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Modal Header -->
	<div class="flex items-center justify-between px-6 py-4 border-b border-brand-primary-gray">
		<div class="flex items-center gap-x-3">
			<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
			<h3 class="text-xl font-semibold text-left text-white">Template Details</h3>
		</div>
		<button type="button" class="cursor-pointer w-9" onclick={toggleTemplateModal}>
			<img src={modal_cross} alt="Close modal" class="w-7" />
		</button>
	</div>

	<!-- Tab Headers -->
	<div class="flex items-center w-full my-3 text-sm px-7 gap-x-5">
		<button
			class="p-1.5 cursor-pointer border-b-white"
			class:border-b-2={activeTab === 'Edit Action'}
			onclick={() => setActiveTab('Edit Action')}
		>
			Code
		</button>
		<button
			class="p-1.5 cursor-pointer border-b-white"
			class:border-b-2={activeTab === 'README.md'}
			onclick={() => setActiveTab('README.md')}
		>
			README.md
		</button>
		<button
			class="p-1.5 cursor-pointer border-b-white"
			class:border-b-2={activeTab === 'Requirements'}
			onclick={() => setActiveTab('Requirements')}
		>
			Requirements
		</button>

	</div>

	<!-- Tab Content -->
	<div class="container px-7">
		{#if activeTab === 'Edit Action'}
			<CodeEditor code={TemplateDetails[0].code} />
		{:else if activeTab === 'README.md'}
			<ReadMe content={TemplateDetails[0].readme}/>
		{:else if activeTab === 'Requirements'}
			<Requirement content={TemplateDetails[0].requirements} />
		{:else if activeTab === 'Folder Structure'}
			<h2>Folder Structure</h2>
		{/if}
	</div>
</div>

<style>
	.container {
		width: 100%;
		height: 500px;
	}
</style>
