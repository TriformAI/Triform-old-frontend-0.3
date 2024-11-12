<!-- @migration-task Error while migrating Svelte code: `<button>` is invalid inside `<button>` -->
<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import search_icon from '$lib/icons/search.svg';
	import filter from '$lib/icons/filter.svg';
	import unpined from '$lib/icons/unpined.svg';
	import pined from '$lib/icons/pined.svg';
	import Add from '$lib/icons/add.svg';
	import {templateLibraryModal, templateModal} from '$lib/stores/modals';

	let searchTerm = '';

	let pined_unpined = false;
	let activeIndex = null; // Store the active index for the modal

	function togglePined() {
		pined_unpined = !pined_unpined;
	}

	let actualTemplates = [
		{
			code: 'import os\r\nimport json\r\n\r\nfrom langchain_openai import ChatOpenAI  # Interface to OpenAI\'s Chat models.\r\nfrom langchain_core.prompts.chat import (\r\n    ChatPromptTemplate,  # For crafting chat-based prompts.\r\n    SystemMessagePromptTemplate,  # For creating system messages in chat prompts.\r\n)\r\n\r\nOPENAI_API_KEY = os.environ[\r\n    "OPENAI_API_KEY"\r\n]  # Securely fetch OpenAI API key from environment variables.\r\n\r\n\r\ndef handler(event, context):\r\n    # Extract the question and context from the event object.\r\n    question = event.get("question")\r\n    retrieved_context = event.get("retrieved_context")\r\n\r\n    # Validate presence of question and context.\r\n    if not question:\r\n        return {"error": "No question provided"}\r\n    if not retrieved_context:\r\n        return {"error": "No retrieved context provided"}\r\n\r\n    # Template for the chat where the model plays the role of an assistant using provided context.\r\n    template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don\'t know the answer, just say that you don\'t know. Use three sentences maximum and keep the answer concise.\r\n    Question: {question}\r\n    Context: {context}\r\n    Answer:\r\n    """\r\n    # Create a system message prompt from the predefined template.\r\n    system_message_prompt = SystemMessagePromptTemplate.from_template(template)\r\n\r\n    # Prepare the chat prompt with the system message.\r\n    chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt])\r\n\r\n    # Initialize the ChatOpenAI object with model specifications and API key.\r\n    llm = ChatOpenAI(\r\n        model_name="gpt-4-turbo-preview", temperature=0, openai_api_key=OPENAI_API_KEY\r\n    )\r\n\r\n    # Generate a chat completion using the prepared prompt, formatted with actual context and question.\r\n    response = llm.invoke(\r\n        chat_prompt.format_prompt(\r\n            context=retrieved_context, question=question\r\n        ).to_messages()\r\n    )\r\n\r\n    # Return the model\'s response as a JSON-formatted string.\r\n    return json.dumps({"output_0": response.content})',
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
		},
		{
			code: 'import os\r\nimport json\r\n\r\nfrom langchain_openai import ChatOpenAI  # Interface to OpenAI\'s Chat models.\r\nfrom langchain_core.prompts.chat import (\r\n    ChatPromptTemplate,  # For crafting chat-based prompts.\r\n    SystemMessagePromptTemplate,  # For creating system messages in chat prompts.\r\n)\r\n\r\nOPENAI_API_KEY = os.environ[\r\n    "OPENAI_API_KEY"\r\n]  # Securely fetch OpenAI API key from environment variables.\r\n\r\n\r\ndef handler(event, context):\r\n    # Extract the question and context from the event object.\r\n    question = event.get("question")\r\n    retrieved_context = event.get("retrieved_context")\r\n\r\n    # Validate presence of question and context.\r\n    if not question:\r\n        return {"error": "No question provided"}\r\n    if not retrieved_context:\r\n        return {"error": "No retrieved context provided"}\r\n\r\n    # Template for the chat where the model plays the role of an assistant using provided context.\r\n    template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don\'t know the answer, just say that you don\'t know. Use three sentences maximum and keep the answer concise.\r\n    Question: {question}\r\n    Context: {context}\r\n    Answer:\r\n    """\r\n    # Create a system message prompt from the predefined template.\r\n    system_message_prompt = SystemMessagePromptTemplate.from_template(template)\r\n\r\n    # Prepare the chat prompt with the system message.\r\n    chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt])\r\n\r\n    # Initialize the ChatOpenAI object with model specifications and API key.\r\n    llm = ChatOpenAI(\r\n        model_name="gpt-4-turbo-preview", temperature=0, openai_api_key=OPENAI_API_KEY\r\n    )\r\n\r\n    # Generate a chat completion using the prepared prompt, formatted with actual context and question.\r\n    response = llm.invoke(\r\n        chat_prompt.format_prompt(\r\n            context=retrieved_context, question=question\r\n        ).to_messages()\r\n    )\r\n\r\n    # Return the model\'s response as a JSON-formatted string.\r\n    return json.dumps({"output_0": response.content})',
			created_at: '2024-04-22T16:31:07.000000Z',
			deleted_at: null,
			description:
				"This Python module integrates with OpenAI's Chat models to provide context-driven responses based on a given question and retrieved context. It utilizes templates to format prompts for the AI, enabling precise and relevant answers.",
			id: 1,
			name: 'Ask GPT',
			readme:
				'# Triform.ai Template: Contextual Chat Handler\r\n\r\n## Overview\r\n\r\nThis Python module integrates with OpenAI\'s Chat models to provide context-driven responses based on a given question and retrieved context. It utilizes templates to format prompts for the AI, enabling precise and relevant answers.\r\n\r\n## How it Works\r\n\r\nThe module extracts a question and its related context from event data, validates their presence, and formats them into a chat prompt using predefined templates. It then uses the `ChatOpenAI` interface to generate responses based on this context.\r\n\r\n## Use Cases\r\n\r\n- Automating customer support by providing responses that consider previous interactions or specific queries.\r\n- Enhancing virtual assistant functionalities to offer more context-aware responses in chatbots.\r\n- Implementing AI-driven tutoring systems where context from textbooks or lessons is used to answer student inquiries.\r\n\r\n## Customization\r\n\r\n- Modify the prompt templates to change the structure of the conversation or the type of responses.\r\n- Switch the OpenAI model (e.g., from "gpt-4-turbo-preview" to another model) to vary response styles or capabilities.\r\n- Adapt the module for different languages or domains by adjusting the chat templates and model settings.\r\n\r\n## Environment Setup\r\n\r\nSet the following environment variables in your Triform.ai environment:\r\n- `OPENAI_API_KEY`: API key for OpenAI authentication.',
			requirements: 'langchain\r\nlangchain-openai',
			tagsAssigned: 'Cohere, Anthropic, PGVector, LlamaIndex, Vectorize, RAG',
			updated_at: '2024-04-22T17:13:35.000000Z'
		},
		{
			code: 'import os\r\nimport json\r\n\r\nfrom langchain_openai import ChatOpenAI  # Interface to OpenAI\'s Chat models.\r\nfrom langchain_core.prompts.chat import (\r\n    ChatPromptTemplate,  # For crafting chat-based prompts.\r\n    SystemMessagePromptTemplate,  # For creating system messages in chat prompts.\r\n)\r\n\r\nOPENAI_API_KEY = os.environ[\r\n    "OPENAI_API_KEY"\r\n]  # Securely fetch OpenAI API key from environment variables.\r\n\r\n\r\ndef handler(event, context):\r\n    # Extract the question and context from the event object.\r\n    question = event.get("question")\r\n    retrieved_context = event.get("retrieved_context")\r\n\r\n    # Validate presence of question and context.\r\n    if not question:\r\n        return {"error": "No question provided"}\r\n    if not retrieved_context:\r\n        return {"error": "No retrieved context provided"}\r\n\r\n    # Template for the chat where the model plays the role of an assistant using provided context.\r\n    template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don\'t know the answer, just say that you don\'t know. Use three sentences maximum and keep the answer concise.\r\n    Question: {question}\r\n    Context: {context}\r\n    Answer:\r\n    """\r\n    # Create a system message prompt from the predefined template.\r\n    system_message_prompt = SystemMessagePromptTemplate.from_template(template)\r\n\r\n    # Prepare the chat prompt with the system message.\r\n    chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt])\r\n\r\n    # Initialize the ChatOpenAI object with model specifications and API key.\r\n    llm = ChatOpenAI(\r\n        model_name="gpt-4-turbo-preview", temperature=0, openai_api_key=OPENAI_API_KEY\r\n    )\r\n\r\n    # Generate a chat completion using the prepared prompt, formatted with actual context and question.\r\n    response = llm.invoke(\r\n        chat_prompt.format_prompt(\r\n            context=retrieved_context, question=question\r\n        ).to_messages()\r\n    )\r\n\r\n    # Return the model\'s response as a JSON-formatted string.\r\n    return json.dumps({"output_0": response.content})',
			created_at: '2024-04-22T16:31:07.000000Z',
			deleted_at: null,
			description:
				"This Python module integrates with OpenAI's Chat models to provide context-driven responses based on a given question and retrieved context. It utilizes templates to format prompts for the AI, enabling precise and relevant answers.",
			id: 2,
			name: 'Ask GPT',
			readme:
				'# Triform.ai Template: Contextual Chat Handler\r\n\r\n## Overview\r\n\r\nThis Python module integrates with OpenAI\'s Chat models to provide context-driven responses based on a given question and retrieved context. It utilizes templates to format prompts for the AI, enabling precise and relevant answers.\r\n\r\n## How it Works\r\n\r\nThe module extracts a question and its related context from event data, validates their presence, and formats them into a chat prompt using predefined templates. It then uses the `ChatOpenAI` interface to generate responses based on this context.\r\n\r\n## Use Cases\r\n\r\n- Automating customer support by providing responses that consider previous interactions or specific queries.\r\n- Enhancing virtual assistant functionalities to offer more context-aware responses in chatbots.\r\n- Implementing AI-driven tutoring systems where context from textbooks or lessons is used to answer student inquiries.\r\n\r\n## Customization\r\n\r\n- Modify the prompt templates to change the structure of the conversation or the type of responses.\r\n- Switch the OpenAI model (e.g., from "gpt-4-turbo-preview" to another model) to vary response styles or capabilities.\r\n- Adapt the module for different languages or domains by adjusting the chat templates and model settings.\r\n\r\n## Environment Setup\r\n\r\nSet the following environment variables in your Triform.ai environment:\r\n- `OPENAI_API_KEY`: API key for OpenAI authentication.',
			requirements: 'langchain\r\nlangchain-openai',
			tagsAssigned: 'Cohere, Anthropic, PGVector, LlamaIndex, Vectorize, RAG',
			updated_at: '2024-04-22T17:13:35.000000Z'
		}
	];

	// Computed property to filter variables based on searchTerm
	$: filteredTemplates = actualTemplates.filter((template) =>
		template.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const toggleTemplateModal = () => {
		templateLibraryModal.update((value) => false);
		templateModal.update((value) => !value);
	};
</script>

<div
	class="absolute left-8 top-44 mt-2 w-[50rem] bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Modal Header -->
	<div class="flex flex-col px-4 py-6 gap-y-5">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="text-xl font-semibold text-left text-white">Templates Library</h3>
			</div>
			{#if pined_unpined}
				<button type="button" class="w-6 cursor-pointer" onclick={togglePined} aria-label="Pin">
					<img src={pined} alt="pined" class="w-6" />
				</button>
			{:else}
				<button type="button" class="w-6 cursor-pointer" onclick={togglePined} aria-label="Unpin">
					<img src={unpined} alt="unpined" class="w-6" />
				</button>
			{/if}
		</div>
		<div class="flex items-center w-full">
			<div class="relative w-full">
				<input
					id="search"
					type="text"
					placeholder="Search..."
					class="w-full px-4 py-3 text-lg border rounded-md bg-website-secondary border-brand-primary-gray"
					bind:value={searchTerm}
				/>
				<img src={search_icon} alt="search_icon" class="absolute inset-y-0 w-6 right-3 top-3.5" />
			</div>
		</div>
	</div>

	<!-- Collapsible Category List -->
	<div class="py-4 overflow-y-auto h-[20rem] bg-website-primary">
		{#each filteredTemplates as category, i}
			<div
				class={`group flex items-center justify-between w-full duration-200 ease-in-out hover:bg-website-tertiary border-y border-y-brand-primary-gray`}
			>
				<div class="flex flex-col w-full px-6 py-3 overflow-hidden">
					<div class="flex items-center justify-between w-full">
						<div>
							<h3 class="my-1 text-lg font-bold text-left text-white">{category.name}</h3>
							<div class="flex items-center w-full gap-2">
								{#each category.tagsAssigned && category.tagsAssigned.split(', ') as tag}
									<span
										class="px-3 py-1.5 text-xs text-brand-light-gray rounded-md bg-website-secondary border border-white/10 hover:border-white/30"
										>{tag}</span
									>
								{/each}
							</div>
						</div>
						<div
							class="items-center flex-shrink-0 hidden duration-200 ease-in-out group-hover:flex gap-x-5"
						>
							<div class="flex items-center gap-x-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 576 512"
									width="20"
									height="20"
								>
									<path
										fill="#ffffff"
										d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
									/>
								</svg>
								<a
									href={`?TID=${i-1}`}
									onclick={toggleTemplateModal}
									class="text-xs hover:text-white">View Details</a
								>
							</div>
							<button
								class={`flex items-center justify-center flex-shrink-0 gap-x-3 p-2 text-xs text-md font-medium text-brand-tertiary-gray hover:text-white transition duration-200 ease-in-out border rounded-lg bg-white/5 border-brand-primary-gray hover:border-white`}
							>
								<img src={Add} alt="Add_Icon" class="w-4" />
								<span>Use Template</span>
							</button>
						</div>
					</div>

					<p class="mt-2 text-sm text-left text-brand-light-gray max-w-[40em] truncate-description">
						{category.description}
					</p>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.truncate-description {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
