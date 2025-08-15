export interface EventData {
	id: string
	type: string
	data: any
	sourceId?: string
	runId?: string
	parentId?: string
}

export interface MessageData {
	type: 'message'
	role: 'user' | 'assistant'
	content: string
}

export interface StepEventData {
	type: 'step_event'
	id: string
	event: 'started' | 'completed'
	title: string
	children: (StepEventData | MessageData)[]
}

export interface RunData {
	type: 'run'
	id: string
	children: (StepEventData | MessageData)[]
	completed?: boolean
}

export type ParsedItem = MessageData | RunData | StepEventData

export const chat = $state<{ data: ParsedItem[] }>({
	data: []
})

export function parseChatData(events: EventData[]) {
	const messages = new Map<string, MessageData>()
	const runs = new Map<string, RunData>()

	// Keeps track of active step's data and its parent array for nesting
	const activeSteps = new Map<
		string,
		{ step: StepEventData; parentArray: (StepEventData | MessageData)[] }
	>()
	const output: ParsedItem[] = []

	for (const event of events) {
		const { id, type, data, sourceId, runId, parentId } = event

		// Handle messages
		if (type === 'text_message_started') {
			messages.set(id, { type: 'message', role: data.role, content: '' })
		} else if (type === 'text_message_content' && sourceId && messages.has(sourceId)) {
			messages.get(sourceId)!.content += data.delta
		} else if (type === 'text_message_end' && sourceId && messages.has(sourceId)) {
			const message = messages.get(sourceId)!
			if (runId && runs.has(runId)) {
				runs.get(runId)!.children.push(message)
			} else {
				output.push(message)
			}
			messages.delete(sourceId)
		}

		// Handle runs
		if (type === 'run_started') {
			const run: RunData = {
				type: 'run',
				id: id,
				children: []
			}
			runs.set(id, run)
			output.push(run)
		} else if (type === 'run_completed' && sourceId && runs.has(sourceId)) {
			runs.get(sourceId)!.completed = true
			runs.delete(sourceId)
		}

		// Handle steps and nested steps
		if (type === 'step_started') {
			const newStep: StepEventData = {
				type: 'step_event',
				id: id,
				event: 'started',
				title: data.title,
				children: []
			}

			let parentArray: (StepEventData | MessageData)[] = []

			if (runId && runs.has(runId)) {
				if (parentId && activeSteps.has(parentId)) {
					// Nested step
					parentArray = activeSteps.get(parentId)!.step.children
					parentArray.push(newStep)
				} else {
					// Top-level step
					parentArray = runs.get(runId)!.children
					parentArray.push(newStep)
				}
			}
			activeSteps.set(id, { step: newStep, parentArray: parentArray })
		} else if (type === 'step_completed') {
			if (sourceId && activeSteps.has(sourceId)) {
				const { parentArray } = activeSteps.get(sourceId)!
				const completedEvent: StepEventData = {
					type: 'step_event',
					id: sourceId,
					event: 'completed',
					title: data.title,
					children: []
				}
				parentArray.push(completedEvent)
				activeSteps.delete(sourceId)
			}
		}
	}

	chat.data = output
}
