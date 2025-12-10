import { z } from 'zod'
import { unresolvedModifierMappingModel } from './modifiers'

export const copyPayloadModel = z.object({
  schema: z.literal('tf-component-copy/v1').describe('matcher to ensure the payload is a valid copy payload'),
  component_id: z.uuid(),
  organization_id: z.string(),
  modifiers: unresolvedModifierMappingModel
})