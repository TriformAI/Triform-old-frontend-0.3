/* eslint-disable */
import type { UUID } from 'node:crypto'
/**
 * This file was automatically generated from Zod schemas.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source schemas,
 * and run the generateSchema script to regenerate this file.
 */

export interface Action {
	id?: UUID
	resource: 'action/v1'
	meta: Meta & { starred: boolean }
	spec: {
		source: string
		requirements: string
		checksum: string
		readme: string
		runtime: 'python-3.14'
	}
}

export interface ActionSpec {
	source: string
	requirements: string
	checksum: string
	readme: string
	runtime: 'python-3.14'
}

export interface ComponentMeta {
	name: string
	intention: {
		purpose: string
		input: string
		output: string
	}
	starred: boolean
}

export type Component =
	| {
			id?: UUID
			resource: 'flow/v1'
			meta: Meta & { starred: boolean }
			spec: {
				readme: string
				nodes: {
					[k: string]: {
						component_id: UUID
						inputs: {
							[k: string]: {
								source: string | 'parent'
								target: string
							}
						}
						position: {
							x: number
							y: number
						}
					}
				}
				outputs: {
					[k: string]:
						| {
								source: string | 'parent'
								target: string
						  }
						| {
								[k: string]: {
									[k: string]: unknown
								}
						  }
				}
				inputs: {
					[k: string]: {
						[k: string]: {
							[k: string]: unknown
						}
					}
				}
			}
	  }
	| {
			id?: UUID
			resource: 'action/v1'
			meta: Meta & { starred: boolean }
			spec: {
				source: string
				requirements: string
				checksum: string
				readme: string
				runtime: 'python-3.14'
			}
	  }

export interface Cron {
	id?: UUID
	resource: 'cron/v1'
	meta: Meta
	spec: {
		schedule: string
		timezone: string
	}
}

export interface CronSpec {
	schedule: string
	timezone: string
}

export interface Endpoint {
	id?: UUID
	resource: 'endpoint/v1'
	meta: Meta
	spec: {
		method: 'POST'
	}
}

export interface EndpointSpec {
	method: 'POST'
}

/**
 * This interface was referenced by `Execution`'s JSON-Schema
 * via the `definition` "__schema0".
 */
export type ResolvedComponent =
	| {
			id?: UUID
			resource: 'flow/v1'
			meta: Meta & { starred: boolean }
			spec: {
				readme: string
				nodes: {
					[k: string]: {
						component_id?: UUID
						spec: ResolvedComponent
						inputs: {
							[k: string]: {
								source: string | 'parent'
								target: string
							}
						}
					}
				}
				outputs: {
					[k: string]:
						| {
								source: string | 'parent'
								target: string
						  }
						| {
								[k: string]: {
									[k: string]: unknown
								}
						  }
				}
				inputs: {
					[k: string]: {
						[k: string]: {
							[k: string]: unknown
						}
					}
				}
			}
	  }
	| {
			id?: UUID
			resource: 'action/v1'
			meta: Meta & { starred: boolean }
			spec: {
				source: string
				requirements: string
				checksum: string
				readme: string
				runtime: 'python-3.14'
			}
	  }

export interface Execution {
	resource: 'execution/v1'
	meta: Omit<Meta, 'intention'>
	spec: {
		component: ResolvedComponent
		payload: {
			[k: string]: unknown
		}
		modifiers: {
			[k: string]: {
				modifier_id: UUID
				spec: {
					id?: UUID
					resource: 'variable/v1'
					meta: Meta
					spec: {
						key: string
						value: string
						secret: boolean
					}
				}
			}[]
		}
	}
}

export interface Flow {
	id?: UUID
	resource: 'flow/v1'
	meta: Meta & { starred: boolean }
	spec: {
		readme: string
		nodes: {
			[k: string]: {
				component_id: UUID
				inputs: {
					[k: string]: {
						source: string | 'parent'
						target: string
					}
				}
				position: {
					x: number
					y: number
				}
			}
		}
		outputs: {
			[k: string]:
				| {
						source: string | 'parent'
						target: string
				  }
				| {
						[k: string]: {
							[k: string]: unknown
						}
				  }
		}
		inputs: {
			[k: string]: {
				[k: string]: {
					[k: string]: unknown
				}
			}
		}
	}
}

export interface IngressToken {
	id?: UUID
	resource: 'ingress-token/v1'
	meta: Meta
	spec: {
		hashedToken: UUID
	}
}

export interface IngressTokenSpec {
	hashedToken: UUID
}

export interface Meta {
	name: string
	intention: {
		purpose: string
		input: string
		output: string
	}
}

export type Modifier = {
	id?: UUID
	resource: 'variable/v1'
	meta: Meta
	spec: {
		key: string
		value: string
		secret: boolean
	}
}

export interface Project {
	id?: UUID
	resource: 'project/v1'
	meta: Meta
	spec: {
		nodes: {
			[k: string]: {
				component_id: UUID
			}
		}
		modifiers: {
			[k: string]: {
				modifier_id: UUID
			}[]
		}
	}
}

export interface ProjectSpec {
	nodes: {
		[k: string]: {
			component_id: UUID
		}
	}
	modifiers: {
		[k: string]: {
			modifier_id: UUID
		}[]
	}
}

export interface ResolvedFlow {
	id?: UUID
	resource: 'flow/v1'
	meta: Meta & { starred: boolean }
	spec: {
		readme: string
		nodes: {
			[k: string]: {
				component_id?: UUID
				spec:
					| ResolvedFlow
					| {
							id?: UUID
							resource: 'action/v1'
							meta: Meta & { starred: boolean }
							spec: {
								source: string
								requirements: string
								checksum: string
								readme: string
								runtime: 'python-3.14'
							}
					  }
				inputs: {
					[k: string]: {
						source: string | 'parent'
						target: string
					}
				}
			}
		}
		outputs: {
			[k: string]:
				| {
						source: string | 'parent'
						target: string
				  }
				| {
						[k: string]: {
							[k: string]: unknown
						}
				  }
		}
		inputs: {
			[k: string]: {
				[k: string]: {
					[k: string]: unknown
				}
			}
		}
	}
}

export interface ResolvedProject {
	id?: UUID
	resource: 'project/v1'
	meta: Meta
	spec: {
		nodes: {
			[k: string]: {
				component_id: UUID
				spec:
					| {
							id?: UUID
							resource: 'flow/v1'
							meta: Meta & { starred: boolean }
							spec: {
								readme: string
								nodes: {
									[k: string]: {
										component_id: UUID
										inputs: {
											[k: string]: {
												source: string | 'parent'
												target: string
											}
										}
										position: {
											x: number
											y: number
										}
									}
								}
								outputs: {
									[k: string]:
										| {
												source: string | 'parent'
												target: string
										  }
										| {
												[k: string]: {
													[k: string]: unknown
												}
										  }
								}
								inputs: {
									[k: string]: {
										[k: string]: {
											[k: string]: unknown
										}
									}
								}
							}
					  }
					| {
							id?: UUID
							resource: 'action/v1'
							meta: Meta & { starred: boolean }
							spec: {
								source: string
								requirements: string
								checksum: string
								readme: string
								runtime: 'python-3.14'
							}
					  }
				inputs: {
					[k: string]: {
						source: string | 'parent'
						target: string
					}
				}
			}
		}
		modifiers: {
			[k: string]: {
				modifier_id: UUID
				spec: {
					id?: UUID
					resource: 'variable/v1'
					meta: Meta
					spec: {
						key: string
						value: string
						secret: boolean
					}
				}
			}[]
		}
	}
}

export interface ResolvedProjectSpec {
	nodes: {
		[k: string]: {
			component_id: UUID
			spec:
				| {
						id?: UUID
						resource: 'flow/v1'
						meta: Meta & { starred: boolean }
						spec: {
							readme: string
							nodes: {
								[k: string]: {
									component_id: UUID
									inputs: {
										[k: string]: {
											source: string | 'parent'
											target: string
										}
									}
									position: {
										x: number
										y: number
									}
								}
							}
							outputs: {
								[k: string]:
									| {
											source: string | 'parent'
											target: string
									  }
									| {
											[k: string]: {
												[k: string]: unknown
											}
									  }
							}
							inputs: {
								[k: string]: {
									[k: string]: {
										[k: string]: unknown
									}
								}
							}
						}
				  }
				| {
						id?: UUID
						resource: 'action/v1'
						meta: Meta & { starred: boolean }
						spec: {
							source: string
							requirements: string
							checksum: string
							readme: string
							runtime: 'python-3.14'
						}
				  }
			inputs: {
				[k: string]: {
					source: string | 'parent'
					target: string
				}
			}
		}
	}
	modifiers: {
		[k: string]: {
			modifier_id: UUID
			spec: {
				id?: UUID
				resource: 'variable/v1'
				meta: Meta
				spec: {
					key: string
					value: string
					secret: boolean
				}
			}
		}[]
	}
}

export type Trigger =
	| {
			id?: UUID
			resource: 'endpoint/v1'
			meta: Meta
			spec: {
				method: 'POST'
			}
	  }
	| {
			id?: UUID
			resource: 'cron/v1'
			meta: Meta
			spec: {
				schedule: string
				timezone: string
			}
	  }

export interface Variable {
	id?: UUID
	resource: 'variable/v1'
	meta: Meta
	spec: {
		key: string
		value: string
		secret: boolean
	}
}

export interface VariableSpec {
	key: string
	value: string
	secret: boolean
}

// ──────────────────────
// Type Guard Functions
// ──────────────────────

export const isFlow = (
	component: Component | ResolvedComponent
): component is Flow | ResolvedFlow => component.resource === 'flow/v1'

export const isAction = (component: Component | ResolvedComponent): component is Action =>
	component.resource === 'action/v1'
