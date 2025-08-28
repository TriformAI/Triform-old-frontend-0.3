import type * as z from 'zod'
import { actionModel, ioModel, schemaToPython, getRequiredImports } from '$lib/schemas'

interface TypedDictClass {
	name: string
	fields: string[]
	description: string
	isOutput: boolean
}

/**
 * Generate Python type annotation and class definitions for a parameter
 */
function generatePythonType(schema: unknown, paramName: string): { type: string, classes: TypedDictClass[] } {
	const classes: TypedDictClass[] = []
	
	function processSchema(s: unknown, name: string): string {
		if (!s || typeof s !== 'object') {
			return 'Any'
		}
		
		const schema = s as Record<string, unknown>
		
		// Handle object types by creating TypedDict classes
		if (schema.type === 'object' && schema.properties) {
			const className = `${name.charAt(0).toUpperCase() + name.slice(1)}Type`
			const properties = schema.properties as Record<string, unknown>
			const required = Array.isArray(schema.required) ? (schema.required as string[]) : []
			const fields: string[] = []
			
			for (const [key, value] of Object.entries(properties)) {
				const fieldType = processSchema(value, `${name}${key.charAt(0).toUpperCase() + key.slice(1)}`)
				const isRequired = required.includes(key)
				
				if (isRequired) {
					fields.push(`    ${key}: ${fieldType}`)
				} else {
					fields.push(`    ${key}: Optional[${fieldType}]`)
				}
			}
			
			classes.push({
				name: className,
				fields,
				description: `${className} type definition`,
				isOutput: false
			})
			
			return className
		}
		
		// Handle arrays
		if (schema.type === 'array' && schema.items) {
			const itemType = processSchema(schema.items, `${name}Item`)
			return `List[${itemType}]`
		}
		
		// Handle other types using schemaToPython
		return schemaToPython(schema)
	}
	
	const type = processSchema(schema, paramName)
	return { type, classes }
}

export const getActionModel = (inputs: z.infer<typeof ioModel>, name = '') => {
	// Generate Python types for inputs
	const inputTypes: Record<string, string> = {}
	const inputClasses: TypedDictClass[] = []
	for (const [key, value] of Object.entries(inputs)) {
		const { type, classes } = generatePythonType(value.schema, key)
		inputTypes[key] = type
		inputClasses.push(...classes)
	}
	
	// Generate Python types for outputs (same as inputs for now, but could be different)
	const outputTypes: Record<string, string> = {}
	const outputClasses: TypedDictClass[] = []
	
	for (const [key, value] of Object.entries(inputs)) {
		const { type, classes } = generatePythonType(value.schema, key)
		outputTypes[key] = type
		outputClasses.push(...classes.map(cls => ({ ...cls, isOutput: key === Object.keys(inputs)[Object.keys(inputs).length - 1] })))
	}
	
	// Create all unique classes (avoid duplicates)
	const allClasses = [...inputClasses, ...outputClasses]
	const uniqueClasses = allClasses.filter((cls, index, arr) => 
		arr.findIndex(c => c.name === cls.name) === index
	)
	
	// Generate imports based on used types - let schemaToPython handle the logic
	const allPythonTypes = [
		...Object.values(inputTypes),
		...Object.values(outputTypes),
		...uniqueClasses.flatMap(c => c.fields)
	]
	const typingImports = getRequiredImports(allPythonTypes)
	
	// Generate function parameters
	const inputArgs = Object.entries(inputTypes)
		.map(([key, type]) => `${key}: ${type}`)
		.join(', ')
	
	// Generate input descriptions for docstring
	const inputDescriptions = Object.entries(inputs)
		.map(([key, value]) => `    ${key}: ${value.description || 'No description provided'}`)
		.join('\n')
	
	// Generate output descriptions for docstring
	const outputDescriptions = Object.entries(inputs)
		.map(([key, value]) => `    ${key}: ${value.description || 'No description provided'}`)
		.join('\n')
	
	// Generate output fields for the Output class
	const outputFields = Object.entries(outputTypes)
		.map(([key, type]) => `    ${key}: ${type}`)
		.join('\n')
	
	// Generate return statement
	const outputKeys = Object.keys(outputTypes)
		.map(key => `        ${key}=${key}`)
		.join(',\n')
	
	// Generate class definitions
	const classDefinitions = uniqueClasses
		.filter(cls => !cls.isOutput) // Don't generate separate classes for output, we'll use the main Output class
		.map(cls => `
class ${cls.name}(TypedDict):
    """${cls.description}"""
${cls.fields.join('\n')}`)
		.join('\n')
	
	const classSection = classDefinitions ? classDefinitions + '\n' : ''
	
	const source = `
from typing import ${typingImports.join(', ')}

${classSection}@triform.output
class Output(TypedDict):
    """The output of the action.
    Attributes:
${outputDescriptions}
    """
${outputFields}

@triform.entrypoint
def entrypoint(${inputArgs}) -> Output:
    """A simple placeholder action.
    Args:
${inputDescriptions}
    """
    return Output(
${outputKeys}
    )`.trim()

	return {
		resource: 'action/v1',
		meta: {
			name,
			intention: '',
			starred: false
		},
		spec: {
			source,
			readme: '',
			requirements: '',
			checksum: '',
			runtime: 'python-3.13',
			// populated whenever we save the action based on the source code:
			inputs: {},
			outputs: {}
		}
	} satisfies Omit<z.infer<typeof actionModel>, 'id'>
}
