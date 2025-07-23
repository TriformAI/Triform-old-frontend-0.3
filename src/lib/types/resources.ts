/* eslint-disable */
import type { UUID } from 'node:crypto'
/**
 * This file was automatically generated from Zod schemas.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source schemas,
 * and run the generateSchema script to regenerate this file.
 */

export interface Action {
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

export type Component =
	| {
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
	resource: 'cron/v1'
	meta: Meta
	spec: {
		schedule: string
		timezone: string
	}
}

export interface Endpoint {
	resource: 'endpoint/v1'
	meta: Meta
	spec: {
		method: 'POST'
	}
}

/**
 * This interface was referenced by `Execution`'s JSON-Schema
 * via the `definition` "__schema0".
 */
export type _Schema0 =
	| {
			resource: 'flow/v1'
			meta: Meta & { starred: boolean }
			spec: {
				readme: string
				nodes: {
					[k: string]: {
						component_id: UUID
						spec: _Schema0
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
		component: _Schema0
		payload: {
			[k: string]: unknown
		}
		modifiers?: {
			[k: string]: {
				resource: 'variable/v1'
				meta: Meta
				spec: {
					key: string
					value: string
					secret: boolean
				}
			}
		}
	}
}

export interface Flow {
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
	resource: 'ingress-token/v1'
	meta: Meta
	spec: {
		hashedToken: UUID
	}
}

export interface Meta {
	name: string
	intention: {
		purpose: string
		input: string
		output: string
	}
	id: UUID
}

export type Modifier = {
	resource: 'variable/v1'
	meta: Meta
	spec: {
		key: string
		value: string
		secret: boolean
	}
}

export interface Project {
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
			}
		}
	}
}

export type ResolvedComponent =
	| {
			resource: 'flow/v1'
			meta: Meta & { starred: boolean }
			spec: {
				readme: string
				nodes: {
					[k: string]: {
						component_id: UUID
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

export interface ResolvedFlow {
	resource: 'flow/v1'
	meta: Meta & { starred: boolean }
	spec: {
		readme: string
		nodes: {
			[k: string]: {
				component_id: UUID
				spec:
					| ResolvedFlow
					| {
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
	resource: 'project/v1'
	meta: Meta
	spec: {
		nodes: {
			[k: string]: {
				component_id: UUID
				spec:
					| {
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
					resource: 'variable/v1'
					meta: Meta
					spec: {
						key: string
						value: string
						secret: boolean
					}
				}
			}
		}
	}
}

export type Trigger =
	| {
			resource: 'endpoint/v1'
			meta: Meta
			spec: {
				method: 'POST'
			}
	  }
	| {
			resource: 'cron/v1'
			meta: Meta
			spec: {
				schedule: string
				timezone: string
			}
	  }

export interface Variable {
	resource: 'variable/v1'
	meta: Meta
	spec: {
		key: string
		value: string
		secret: boolean
	}
}

// ──────────────────────
// Type Guard Functions
// ──────────────────────

export const isFlow = (spec: Component): spec is Flow => spec.resource === 'flow/v1'

export const isAction = (spec: Component): spec is Action => spec.resource === 'action/v1'
