import * as z from 'zod'
import { componentMetaModel, nodePortModel } from './common.js'
import { jsonSchemaTypeModel } from './type.js'

const abstractComponentModel = z.strictObject({
	id: z.uuidv4().optional(),
	resource: z.string(),
	meta: componentMetaModel,
	spec: z.strictObject({})
})

export const ioModel = z.record(
	z.string(),
	z.strictObject({
		description: z.string().default(''),
		type: z.union([jsonSchemaTypeModel, z.record(z.never(), z.never())])
	})
)

const flowOutputModel = z.record(
	ioModel.keyType,
	ioModel.valueType.extend({
		source: z.string(),
		target: z.string()
	})
)

// Action models (without complex validations)
export const actionSpecModel = z.strictObject({
	source: z.string(),
	requirements: z.string().optional().default(''),
	checksum: z.string().optional().default(''),
	readme: z.string().optional().default(''),
	runtime: z.literal('python-3.14').default('python-3.14'),
	inputs: ioModel,
	outputs: ioModel
})

export const actionModel = abstractComponentModel.extend({
	resource: z.literal('action/v1'),
	spec: actionSpecModel
})

const positionModel = z.strictObject({
	x: z.number(),
	y: z.number()
})

// Flow models (without async validations)
const flowNodeValueModel = z.strictObject({
	component_id: z.uuidv4(),
	spec: z.lazy((): z.ZodTypeAny => componentModel),
	inputs: z.record(z.string(), nodePortModel),
	position: positionModel.default({ x: 0, y: 0 })
})

const flowNodeModel = z.record(z.string(), flowNodeValueModel)

const flowSpecModel = z.strictObject({
	readme: z.string().optional().default(''),
	nodes: z.record(z.string(), flowNodeValueModel.omit({ spec: true })),
	outputs: flowOutputModel,
	inputs: ioModel,
	// store location of the two "built-in" input/output nodes that are only visible inside of the flow
	io_nodes: z
		.strictObject({
			input: positionModel.default({ x: 0, y: 0 }),
			output: positionModel.default({ x: 0, y: 0 })
		})
		.default({
			input: { x: 0, y: 0 },
			output: { x: 0, y: 0 }
		})
})

export const flowModel = abstractComponentModel.extend({
	resource: z.literal('flow/v1'),
	spec: flowSpecModel
})

export const resolvedFlowModel = flowModel.extend({
	spec: flowModel.shape.spec.extend({
		nodes: flowNodeModel
	})
})

// Agent models (without handlebars validation)
const agentPromptModel = z.array(
	z.strictObject({
		type: z.literal('template'),
		value: z.string()
	})
)

const agentSpecModel = z.strictObject({
	model: z.literal('mistral/mistral-medium-latest'),
	readme: z.string().optional().default(''),
	prompts: z.strictObject({
		system: agentPromptModel,
		user: agentPromptModel
	}),
	settings: z.strictObject({
		temperature: z.number().min(0).max(1).default(0.7),
		topP: z.number().min(0).max(1).default(0.95),
		maxTokens: z.number().min(0).default(1000)
	}),
	nodes: z.record(
		z.string(),
		z.strictObject({
			component_id: z.uuidv4(),
			inputs: z.record(
				z.string(),
				nodePortModel.extend({
					source: z.literal('parent')
				})
			),
			order: z.number().min(0)
		})
	),
	inputs: ioModel,
	outputs: ioModel
})

const resolvedAgentSpecModel = agentSpecModel.extend({
	nodes: z.record(
		agentSpecModel.shape.nodes.keyType,
		agentSpecModel.shape.nodes.valueType.extend({
			get spec() {
				return componentModel
			}
		})
	)
})

export const agentModel = abstractComponentModel.extend({
	resource: z.literal('agent/v1'),
	spec: agentSpecModel
})

export const resolvedAgentModel = agentModel.extend({
	spec: resolvedAgentSpecModel
})

// Union models
export const componentSpecModel = z.union([
	flowSpecModel,
	actionSpecModel,
	agentSpecModel
])

export const componentModel = z.discriminatedUnion('resource', [
	flowModel,
	actionModel,
	agentModel
])

export const componentResourceModel = z.enum(
	componentModel.options.map(o => o.shape.resource.value)
)

export const resolvedComponentModel = z.discriminatedUnion('resource', [
	resolvedFlowModel,
	actionModel,
	resolvedAgentModel
])

// Helper functions
export const isFlow = (
	component:
		| z.infer<typeof componentModel>
		| z.infer<typeof resolvedComponentModel>
): component is z.infer<typeof flowModel> | z.infer<typeof resolvedFlowModel> =>
	component.resource === 'flow/v1'

export const isAction = (
	component:
		| z.infer<typeof componentModel>
		| z.infer<typeof resolvedComponentModel>
): component is z.infer<typeof actionModel> =>
	component.resource === 'action/v1'

export const isAgent = (
	component:
		| z.infer<typeof componentModel>
		| z.infer<typeof resolvedComponentModel>
): component is
	| z.infer<typeof agentModel>
	| z.infer<typeof resolvedAgentModel> => component.resource === 'agent/v1'
