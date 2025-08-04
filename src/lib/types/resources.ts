/* eslint-disable */
import type { UUID } from 'node:crypto'

// Base Meta interface
export interface Meta {
	name: string
	intention: string
}

export type JsonSchemaType =
	| {
			type: 'string' | 'number' | 'boolean' | 'null'
	  }
	| {
			type: 'object'
			properties?: {
				[k: string]: JsonSchemaType
			}
			additionalProperties?: JsonSchemaType
	  }
	| {
			type: 'array'
			items?: JsonSchemaType
	  }

export interface InputOutputSpec {
	description: string
	type: JsonSchemaType | { [k: string]: { [k: string]: unknown } }
}

export interface NodePort {
	source: string | 'parent'
	target: string
}

/**
 * This file was automatically generated from Zod schemas.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source schemas,
 * and run the generateSchema script to regenerate this file.
 */

export interface AbstractResource {
	resource: string
	meta: Meta
	spec: unknown
}

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
		inputs: {
			[k: string]: {
				description: string
				type:
					| JsonSchemaType
					| {
							[k: string]: {
								[k: string]: unknown
							}
					  }
			}
		}
		outputs: {
			[k: string]: {
				description: string
				type:
					| JsonSchemaType
					| {
							[k: string]: {
								[k: string]: unknown
							}
					  }
			}
		}
	}
}

export interface ActionSpec {
	source: string
	requirements: string
	checksum: string
	readme: string
	runtime: 'python-3.14'
	inputs: {
		[k: string]: {
			description: string
			type:
				| JsonSchemaType
				| {
						[k: string]: {
							[k: string]: unknown
						}
				  }
		}
	}
	outputs: {
		[k: string]: {
			description: string
			type:
				| JsonSchemaType
				| {
						[k: string]: {
							[k: string]: unknown
						}
				  }
		}
	}
}

export interface Agent {
	id?: UUID
	resource: 'agent/v1'
	meta: Meta & { starred: boolean }
	spec: {
		model: 'mistral/mistral-medium-latest'
		readme: string
		prompts: {
			system: {
				type: 'template'
				value: string
			}[]
			user: {
				type: 'template'
				value: string
			}[]
		}
		settings: {
			temperature: number
			topP: number
			maxTokens: number
		}
		nodes: {
			[k: string]: {
				component_id: UUID
				inputs: {
					[k: string]: {
						source: 'parent'
						target: string
					}
				}
				order: number
			}
		}
		inputs: {
			[k: string]: {
				description: string
				type:
					| JsonSchemaType
					| {
							[k: string]: {
								[k: string]: unknown
							}
					  }
			}
		}
		outputs: {
			[k: string]: {
				description: string
				type:
					| JsonSchemaType
					| {
							[k: string]: {
								[k: string]: unknown
							}
					  }
			}
		}
	}
}
export interface ComponentMeta {
	name: string
	intention: string
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
					[k: string]: {
						description: string
						type:
							| JsonSchemaType
							| {
									[k: string]: {
										[k: string]: unknown
									}
							  }
						source: string
						target: string
					}
				}
				inputs: {
					[k: string]: {
						description: string
						type:
							| JsonSchemaType
							| {
									[k: string]: {
										[k: string]: unknown
									}
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
				inputs: {
					[k: string]: {
						description: string
						type:
							| JsonSchemaType
							| {
									[k: string]: {
										[k: string]: unknown
									}
							  }
					}
				}
				outputs: {
					[k: string]: {
						description: string
						type:
							| JsonSchemaType
							| {
									[k: string]: {
										[k: string]: unknown
									}
							  }
					}
				}
			}
	  }
	| {
			id?: UUID
			resource: 'agent/v1'
			meta: Meta & { starred: boolean }
			spec: {
				model: 'mistral/mistral-medium-latest'
				readme: string
				prompts: {
					system: {
						type: 'template'
						value: string
					}[]
					user: {
						type: 'template'
						value: string
					}[]
				}
				settings: {
					temperature: number
					topP: number
					maxTokens: number
				}
				nodes: {
					[k: string]: {
						component_id: UUID
						inputs: {
							[k: string]: {
								source: 'parent'
								target: string
							}
						}
						order: number
					}
				}
				inputs: {
					[k: string]: {
						description: string
						type:
							| JsonSchemaType
							| {
									[k: string]: {
										[k: string]: unknown
									}
							  }
					}
				}
				outputs: {
					[k: string]: {
						description: string
						type:
							| JsonSchemaType
							| {
									[k: string]: {
										[k: string]: unknown
									}
							  }
					}
				}
			}
	  }
export type ComponentSpec =
	| {
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
				[k: string]: {
					description: string
					type:
						| JsonSchemaType
						| {
								[k: string]: {
									[k: string]: unknown
								}
						  }
					source: string
					target: string
				}
			}
			inputs: {
				[k: string]: {
					description: string
					type:
						| JsonSchemaType
						| {
								[k: string]: {
									[k: string]: unknown
								}
						  }
				}
			}
	  }
	| {
			source: string
			requirements: string
			checksum: string
			readme: string
			runtime: 'python-3.14'
			inputs: {
				[k: string]: {
					description: string
					type:
						| JsonSchemaType
						| {
								[k: string]: {
									[k: string]: unknown
								}
						  }
				}
			}
			outputs: {
				[k: string]: {
					description: string
					type:
						| JsonSchemaType
						| {
								[k: string]: {
									[k: string]: unknown
								}
						  }
				}
			}
	  }
	| {
			model: 'mistral/mistral-medium-latest'
			readme: string
			prompts: {
				system: {
					type: 'template'
					value: string
				}[]
				user: {
					type: 'template'
					value: string
				}[]
			}
			settings: {
				temperature: number
				topP: number
				maxTokens: number
			}
			nodes: {
				[k: string]: {
					component_id: UUID
					inputs: {
						[k: string]: {
							source: 'parent'
							target: string
						}
					}
					order: number
				}
			}
			inputs: {
				[k: string]: {
					description: string
					type:
						| JsonSchemaType
						| {
								[k: string]: {
									[k: string]: unknown
								}
						  }
				}
			}
			outputs: {
				[k: string]: {
					description: string
					type:
						| JsonSchemaType
						| {
								[k: string]: {
									[k: string]: unknown
								}
						  }
				}
			}
	  }
export interface Cron {
	resource: 'cron/v1'
	meta: Omit<Meta, 'intention'>
	spec: {
		schedule: string
		timezone: string
		payload: {
			[k: string]: unknown
		}
	}
}
export interface Endpoint {
	resource: 'endpoint/v1'
	meta: Omit<Meta, 'intention'>
	spec: {
		method: 'POST'
		payload_mapping: {
			[k: string]: string
		}
		ingress_tokens: string[]
	}
}

export interface Execution {
	resource: 'execution/v1'
	meta: Omit<Meta, 'intention'>
	spec: {
		component:
			| {
					id?: UUID
					resource: 'flow/v1'
					meta: Meta & { starred: boolean }
					spec: {
						readme: string
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
													[k: string]: {
														description: string
														type:
															| JsonSchemaType
															| {
																	[k: string]: {
																		[k: string]: unknown
																	}
															  }
														source: string
														target: string
													}
												}
												inputs: {
													[k: string]: {
														description: string
														type:
															| JsonSchemaType
															| {
																	[k: string]: {
																		[k: string]: unknown
																	}
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
												inputs: {
													[k: string]: {
														description: string
														type:
															| JsonSchemaType
															| {
																	[k: string]: {
																		[k: string]: unknown
																	}
															  }
													}
												}
												outputs: {
													[k: string]: {
														description: string
														type:
															| JsonSchemaType
															| {
																	[k: string]: {
																		[k: string]: unknown
																	}
															  }
													}
												}
											}
									  }
									| {
											id?: UUID
											resource: 'agent/v1'
											meta: Meta & { starred: boolean }
											spec: {
												model: 'mistral/mistral-medium-latest'
												readme: string
												prompts: {
													system: {
														type: 'template'
														value: string
													}[]
													user: {
														type: 'template'
														value: string
													}[]
												}
												settings: {
													temperature: number
													topP: number
													maxTokens: number
												}
												nodes: {
													[k: string]: {
														component_id: UUID
														inputs: {
															[k: string]: {
																source: 'parent'
																target: string
															}
														}
														order: number
													}
												}
												inputs: {
													[k: string]: {
														description: string
														type:
															| JsonSchemaType
															| {
																	[k: string]: {
																		[k: string]: unknown
																	}
															  }
													}
												}
												outputs: {
													[k: string]: {
														description: string
														type:
															| JsonSchemaType
															| {
																	[k: string]: {
																		[k: string]: unknown
																	}
															  }
													}
												}
											}
									  }
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
							[k: string]: {
								description: string
								type:
									| JsonSchemaType
									| {
											[k: string]: {
												[k: string]: unknown
											}
									  }
								source: string
								target: string
							}
						}
						inputs: {
							[k: string]: {
								description: string
								type:
									| JsonSchemaType
									| {
											[k: string]: {
												[k: string]: unknown
											}
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
						inputs: {
							[k: string]: {
								description: string
								type:
									| JsonSchemaType
									| {
											[k: string]: {
												[k: string]: unknown
											}
									  }
							}
						}
						outputs: {
							[k: string]: {
								description: string
								type:
									| JsonSchemaType
									| {
											[k: string]: {
												[k: string]: unknown
											}
									  }
							}
						}
					}
			  }
			| {
					id?: UUID
					resource: 'agent/v1'
					meta: Meta & { starred: boolean }
					spec: {
						model: 'mistral/mistral-medium-latest'
						readme: string
						prompts: {
							system: {
								type: 'template'
								value: string
							}[]
							user: {
								type: 'template'
								value: string
							}[]
						}
						settings: {
							temperature: number
							topP: number
							maxTokens: number
						}
						nodes: {
							[k: string]: {
								component_id: UUID
								inputs: {
									[k: string]: {
										source: 'parent'
										target: string
									}
								}
								order: number
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
													[k: string]: {
														description: string
														type:
															| JsonSchemaType
															| {
																	[k: string]: {
																		[k: string]: unknown
																	}
															  }
														source: string
														target: string
													}
												}
												inputs: {
													[k: string]: {
														description: string
														type:
															| JsonSchemaType
															| {
																	[k: string]: {
																		[k: string]: unknown
																	}
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
												inputs: {
													[k: string]: {
														description: string
														type:
															| JsonSchemaType
															| {
																	[k: string]: {
																		[k: string]: unknown
																	}
															  }
													}
												}
												outputs: {
													[k: string]: {
														description: string
														type:
															| JsonSchemaType
															| {
																	[k: string]: {
																		[k: string]: unknown
																	}
															  }
													}
												}
											}
									  }
									| {
											id?: UUID
											resource: 'agent/v1'
											meta: Meta & { starred: boolean }
											spec: {
												model: 'mistral/mistral-medium-latest'
												readme: string
												prompts: {
													system: {
														type: 'template'
														value: string
													}[]
													user: {
														type: 'template'
														value: string
													}[]
												}
												settings: {
													temperature: number
													topP: number
													maxTokens: number
												}
												nodes: {
													[k: string]: {
														component_id: UUID
														inputs: {
															[k: string]: {
																source: 'parent'
																target: string
															}
														}
														order: number
													}
												}
												inputs: {
													[k: string]: {
														description: string
														type:
															| JsonSchemaType
															| {
																	[k: string]: {
																		[k: string]: unknown
																	}
															  }
													}
												}
												outputs: {
													[k: string]: {
														description: string
														type:
															| JsonSchemaType
															| {
																	[k: string]: {
																		[k: string]: unknown
																	}
															  }
													}
												}
											}
									  }
							}
						}
						inputs: {
							[k: string]: {
								description: string
								type:
									| JsonSchemaType
									| {
											[k: string]: {
												[k: string]: unknown
											}
									  }
							}
						}
						outputs: {
							[k: string]: {
								description: string
								type:
									| JsonSchemaType
									| {
											[k: string]: {
												[k: string]: unknown
											}
									  }
							}
						}
					}
			  }
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
						secret: false
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
			[k: string]: {
				description: string
				type:
					| JsonSchemaType
					| {
							[k: string]: {
								[k: string]: unknown
							}
					  }
				source: string
				target: string
			}
		}
		inputs: {
			[k: string]: {
				description: string
				type:
					| JsonSchemaType
					| {
							[k: string]: {
								[k: string]: unknown
							}
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
		hashed_token: UUID
	}
}
export interface IngressTokenSpec {
	hashed_token: UUID
}
export type Modifier = {
	id?: UUID
	resource: 'variable/v1'
	meta: Meta
	spec: {
		key: string
		value: string
		secret: false
	}
}
export type ModifierSpec = {
	key: string
	value: string
	secret: false
}
export interface Project {
	id?: UUID
	resource: 'project/v1'
	meta: Omit<Meta, 'intention'>
	spec: {
		readme: string
		nodes: {
			[k: string]: {
				component_id: UUID
				triggers: {
					[k: string]:
						| {
								resource: 'endpoint/v1'
								meta: Omit<Meta, 'intention'>
								spec: {
									method: 'POST'
									payload_mapping: {
										[k: string]: string
									}
									ingress_tokens: string[]
								}
						  }
						| {
								resource: 'cron/v1'
								meta: Omit<Meta, 'intention'>
								spec: {
									schedule: string
									timezone: string
									payload: {
										[k: string]: unknown
									}
								}
						  }
				}
				order: number
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
	readme: string
	nodes: {
		[k: string]: {
			component_id: UUID
			triggers: {
				[k: string]:
					| {
							resource: 'endpoint/v1'
							meta: Omit<Meta, 'intention'>
							spec: {
								method: 'POST'
								payload_mapping: {
									[k: string]: string
								}
								ingress_tokens: string[]
							}
					  }
					| {
							resource: 'cron/v1'
							meta: Omit<Meta, 'intention'>
							spec: {
								schedule: string
								timezone: string
								payload: {
									[k: string]: unknown
								}
							}
					  }
			}
			order: number
		}
	}
	modifiers: {
		[k: string]: {
			modifier_id: UUID
		}[]
	}
}

export interface ResolvedAgent {
	id?: UUID
	resource: 'agent/v1'
	meta: Meta & { starred: boolean }
	spec: {
		model: 'mistral/mistral-medium-latest'
		readme: string
		prompts: {
			system: {
				type: 'template'
				value: string
			}[]
			user: {
				type: 'template'
				value: string
			}[]
		}
		settings: {
			temperature: number
			topP: number
			maxTokens: number
		}
		nodes: {
			[k: string]: {
				component_id: UUID
				inputs: {
					[k: string]: {
						source: 'parent'
						target: string
					}
				}
				order: number
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
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
										source: string
										target: string
									}
								}
								inputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
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
								inputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
									}
								}
								outputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
									}
								}
							}
					  }
					| {
							id?: UUID
							resource: 'agent/v1'
							meta: Meta & { starred: boolean }
							spec: {
								model: 'mistral/mistral-medium-latest'
								readme: string
								prompts: {
									system: {
										type: 'template'
										value: string
									}[]
									user: {
										type: 'template'
										value: string
									}[]
								}
								settings: {
									temperature: number
									topP: number
									maxTokens: number
								}
								nodes: {
									[k: string]: {
										component_id: UUID
										inputs: {
											[k: string]: {
												source: 'parent'
												target: string
											}
										}
										order: number
									}
								}
								inputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
									}
								}
								outputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
									}
								}
							}
					  }
			}
		}
		inputs: {
			[k: string]: {
				description: string
				type:
					| JsonSchemaType
					| {
							[k: string]: {
								[k: string]: unknown
							}
					  }
			}
		}
		outputs: {
			[k: string]: {
				description: string
				type:
					| JsonSchemaType
					| {
							[k: string]: {
								[k: string]: unknown
							}
					  }
			}
		}
	}
}
export type ResolvedComponent =
	| {
			id?: UUID
			resource: 'flow/v1'
			meta: Meta & { starred: boolean }
			spec: {
				readme: string
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
											[k: string]: {
												description: string
												type:
													| JsonSchemaType
													| {
															[k: string]: {
																[k: string]: unknown
															}
													  }
												source: string
												target: string
											}
										}
										inputs: {
											[k: string]: {
												description: string
												type:
													| JsonSchemaType
													| {
															[k: string]: {
																[k: string]: unknown
															}
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
										inputs: {
											[k: string]: {
												description: string
												type:
													| JsonSchemaType
													| {
															[k: string]: {
																[k: string]: unknown
															}
													  }
											}
										}
										outputs: {
											[k: string]: {
												description: string
												type:
													| JsonSchemaType
													| {
															[k: string]: {
																[k: string]: unknown
															}
													  }
											}
										}
									}
							  }
							| {
									id?: UUID
									resource: 'agent/v1'
									meta: Meta & { starred: boolean }
									spec: {
										model: 'mistral/mistral-medium-latest'
										readme: string
										prompts: {
											system: {
												type: 'template'
												value: string
											}[]
											user: {
												type: 'template'
												value: string
											}[]
										}
										settings: {
											temperature: number
											topP: number
											maxTokens: number
										}
										nodes: {
											[k: string]: {
												component_id: UUID
												inputs: {
													[k: string]: {
														source: 'parent'
														target: string
													}
												}
												order: number
											}
										}
										inputs: {
											[k: string]: {
												description: string
												type:
													| JsonSchemaType
													| {
															[k: string]: {
																[k: string]: unknown
															}
													  }
											}
										}
										outputs: {
											[k: string]: {
												description: string
												type:
													| JsonSchemaType
													| {
															[k: string]: {
																[k: string]: unknown
															}
													  }
											}
										}
									}
							  }
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
					[k: string]: {
						description: string
						type:
							| JsonSchemaType
							| {
									[k: string]: {
										[k: string]: unknown
									}
							  }
						source: string
						target: string
					}
				}
				inputs: {
					[k: string]: {
						description: string
						type:
							| JsonSchemaType
							| {
									[k: string]: {
										[k: string]: unknown
									}
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
				inputs: {
					[k: string]: {
						description: string
						type:
							| JsonSchemaType
							| {
									[k: string]: {
										[k: string]: unknown
									}
							  }
					}
				}
				outputs: {
					[k: string]: {
						description: string
						type:
							| JsonSchemaType
							| {
									[k: string]: {
										[k: string]: unknown
									}
							  }
					}
				}
			}
	  }
	| {
			id?: UUID
			resource: 'agent/v1'
			meta: Meta & { starred: boolean }
			spec: {
				model: 'mistral/mistral-medium-latest'
				readme: string
				prompts: {
					system: {
						type: 'template'
						value: string
					}[]
					user: {
						type: 'template'
						value: string
					}[]
				}
				settings: {
					temperature: number
					topP: number
					maxTokens: number
				}
				nodes: {
					[k: string]: {
						component_id: UUID
						inputs: {
							[k: string]: {
								source: 'parent'
								target: string
							}
						}
						order: number
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
											[k: string]: {
												description: string
												type:
													| JsonSchemaType
													| {
															[k: string]: {
																[k: string]: unknown
															}
													  }
												source: string
												target: string
											}
										}
										inputs: {
											[k: string]: {
												description: string
												type:
													| JsonSchemaType
													| {
															[k: string]: {
																[k: string]: unknown
															}
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
										inputs: {
											[k: string]: {
												description: string
												type:
													| JsonSchemaType
													| {
															[k: string]: {
																[k: string]: unknown
															}
													  }
											}
										}
										outputs: {
											[k: string]: {
												description: string
												type:
													| JsonSchemaType
													| {
															[k: string]: {
																[k: string]: unknown
															}
													  }
											}
										}
									}
							  }
							| {
									id?: UUID
									resource: 'agent/v1'
									meta: Meta & { starred: boolean }
									spec: {
										model: 'mistral/mistral-medium-latest'
										readme: string
										prompts: {
											system: {
												type: 'template'
												value: string
											}[]
											user: {
												type: 'template'
												value: string
											}[]
										}
										settings: {
											temperature: number
											topP: number
											maxTokens: number
										}
										nodes: {
											[k: string]: {
												component_id: UUID
												inputs: {
													[k: string]: {
														source: 'parent'
														target: string
													}
												}
												order: number
											}
										}
										inputs: {
											[k: string]: {
												description: string
												type:
													| JsonSchemaType
													| {
															[k: string]: {
																[k: string]: unknown
															}
													  }
											}
										}
										outputs: {
											[k: string]: {
												description: string
												type:
													| JsonSchemaType
													| {
															[k: string]: {
																[k: string]: unknown
															}
													  }
											}
										}
									}
							  }
					}
				}
				inputs: {
					[k: string]: {
						description: string
						type:
							| JsonSchemaType
							| {
									[k: string]: {
										[k: string]: unknown
									}
							  }
					}
				}
				outputs: {
					[k: string]: {
						description: string
						type:
							| JsonSchemaType
							| {
									[k: string]: {
										[k: string]: unknown
									}
							  }
					}
				}
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
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
										source: string
										target: string
									}
								}
								inputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
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
								inputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
									}
								}
								outputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
									}
								}
							}
					  }
					| {
							id?: UUID
							resource: 'agent/v1'
							meta: Meta & { starred: boolean }
							spec: {
								model: 'mistral/mistral-medium-latest'
								readme: string
								prompts: {
									system: {
										type: 'template'
										value: string
									}[]
									user: {
										type: 'template'
										value: string
									}[]
								}
								settings: {
									temperature: number
									topP: number
									maxTokens: number
								}
								nodes: {
									[k: string]: {
										component_id: UUID
										inputs: {
											[k: string]: {
												source: 'parent'
												target: string
											}
										}
										order: number
									}
								}
								inputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
									}
								}
								outputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
									}
								}
							}
					  }
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
			[k: string]: {
				description: string
				type:
					| JsonSchemaType
					| {
							[k: string]: {
								[k: string]: unknown
							}
					  }
				source: string
				target: string
			}
		}
		inputs: {
			[k: string]: {
				description: string
				type:
					| JsonSchemaType
					| {
							[k: string]: {
								[k: string]: unknown
							}
					  }
			}
		}
	}
}

export interface ResolvedProject {
	id?: UUID
	resource: 'project/v1'
	meta: Omit<Meta, 'intention'>
	spec: {
		readme: string
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
															[k: string]: {
																description: string
																type:
																	| JsonSchemaType
																	| {
																			[k: string]: {
																				[k: string]: unknown
																			}
																	  }
																source: string
																target: string
															}
														}
														inputs: {
															[k: string]: {
																description: string
																type:
																	| JsonSchemaType
																	| {
																			[k: string]: {
																				[k: string]: unknown
																			}
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
														inputs: {
															[k: string]: {
																description: string
																type:
																	| JsonSchemaType
																	| {
																			[k: string]: {
																				[k: string]: unknown
																			}
																	  }
															}
														}
														outputs: {
															[k: string]: {
																description: string
																type:
																	| JsonSchemaType
																	| {
																			[k: string]: {
																				[k: string]: unknown
																			}
																	  }
															}
														}
													}
											  }
											| {
													id?: UUID
													resource: 'agent/v1'
													meta: Meta & { starred: boolean }
													spec: {
														model: 'mistral/mistral-medium-latest'
														readme: string
														prompts: {
															system: {
																type: 'template'
																value: string
															}[]
															user: {
																type: 'template'
																value: string
															}[]
														}
														settings: {
															temperature: number
															topP: number
															maxTokens: number
														}
														nodes: {
															[k: string]: {
																component_id: UUID
																inputs: {
																	[k: string]: {
																		source: 'parent'
																		target: string
																	}
																}
																order: number
															}
														}
														inputs: {
															[k: string]: {
																description: string
																type:
																	| JsonSchemaType
																	| {
																			[k: string]: {
																				[k: string]: unknown
																			}
																	  }
															}
														}
														outputs: {
															[k: string]: {
																description: string
																type:
																	| JsonSchemaType
																	| {
																			[k: string]: {
																				[k: string]: unknown
																			}
																	  }
															}
														}
													}
											  }
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
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
										source: string
										target: string
									}
								}
								inputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
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
								inputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
									}
								}
								outputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
									}
								}
							}
					  }
					| {
							id?: UUID
							resource: 'agent/v1'
							meta: Meta & { starred: boolean }
							spec: {
								model: 'mistral/mistral-medium-latest'
								readme: string
								prompts: {
									system: {
										type: 'template'
										value: string
									}[]
									user: {
										type: 'template'
										value: string
									}[]
								}
								settings: {
									temperature: number
									topP: number
									maxTokens: number
								}
								nodes: {
									[k: string]: {
										component_id: UUID
										inputs: {
											[k: string]: {
												source: 'parent'
												target: string
											}
										}
										order: number
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
															[k: string]: {
																description: string
																type:
																	| JsonSchemaType
																	| {
																			[k: string]: {
																				[k: string]: unknown
																			}
																	  }
																source: string
																target: string
															}
														}
														inputs: {
															[k: string]: {
																description: string
																type:
																	| JsonSchemaType
																	| {
																			[k: string]: {
																				[k: string]: unknown
																			}
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
														inputs: {
															[k: string]: {
																description: string
																type:
																	| JsonSchemaType
																	| {
																			[k: string]: {
																				[k: string]: unknown
																			}
																	  }
															}
														}
														outputs: {
															[k: string]: {
																description: string
																type:
																	| JsonSchemaType
																	| {
																			[k: string]: {
																				[k: string]: unknown
																			}
																	  }
															}
														}
													}
											  }
											| {
													id?: UUID
													resource: 'agent/v1'
													meta: Meta & { starred: boolean }
													spec: {
														model: 'mistral/mistral-medium-latest'
														readme: string
														prompts: {
															system: {
																type: 'template'
																value: string
															}[]
															user: {
																type: 'template'
																value: string
															}[]
														}
														settings: {
															temperature: number
															topP: number
															maxTokens: number
														}
														nodes: {
															[k: string]: {
																component_id: UUID
																inputs: {
																	[k: string]: {
																		source: 'parent'
																		target: string
																	}
																}
																order: number
															}
														}
														inputs: {
															[k: string]: {
																description: string
																type:
																	| JsonSchemaType
																	| {
																			[k: string]: {
																				[k: string]: unknown
																			}
																	  }
															}
														}
														outputs: {
															[k: string]: {
																description: string
																type:
																	| JsonSchemaType
																	| {
																			[k: string]: {
																				[k: string]: unknown
																			}
																	  }
															}
														}
													}
											  }
									}
								}
								inputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
									}
								}
								outputs: {
									[k: string]: {
										description: string
										type:
											| JsonSchemaType
											| {
													[k: string]: {
														[k: string]: unknown
													}
											  }
									}
								}
							}
					  }
				triggers: {
					[k: string]:
						| {
								resource: 'endpoint/v1'
								meta: Omit<Meta, 'intention'>
								spec: {
									method: 'POST'
									payload_mapping: {
										[k: string]: string
									}
									ingress_tokens: string[]
								}
						  }
						| {
								resource: 'cron/v1'
								meta: Omit<Meta, 'intention'>
								spec: {
									schedule: string
									timezone: string
									payload: {
										[k: string]: unknown
									}
								}
						  }
				}
				order: number
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
						secret: false
					}
				}
			}[]
		}
	}
}

export interface ResolvedProjectSpec {
	readme: string
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
														[k: string]: {
															description: string
															type:
																| JsonSchemaType
																| {
																		[k: string]: {
																			[k: string]: unknown
																		}
																  }
															source: string
															target: string
														}
													}
													inputs: {
														[k: string]: {
															description: string
															type:
																| JsonSchemaType
																| {
																		[k: string]: {
																			[k: string]: unknown
																		}
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
													inputs: {
														[k: string]: {
															description: string
															type:
																| JsonSchemaType
																| {
																		[k: string]: {
																			[k: string]: unknown
																		}
																  }
														}
													}
													outputs: {
														[k: string]: {
															description: string
															type:
																| JsonSchemaType
																| {
																		[k: string]: {
																			[k: string]: unknown
																		}
																  }
														}
													}
												}
										  }
										| {
												id?: UUID
												resource: 'agent/v1'
												meta: Meta & { starred: boolean }
												spec: {
													model: 'mistral/mistral-medium-latest'
													readme: string
													prompts: {
														system: {
															type: 'template'
															value: string
														}[]
														user: {
															type: 'template'
															value: string
														}[]
													}
													settings: {
														temperature: number
														topP: number
														maxTokens: number
													}
													nodes: {
														[k: string]: {
															component_id: UUID
															inputs: {
																[k: string]: {
																	source: 'parent'
																	target: string
																}
															}
															order: number
														}
													}
													inputs: {
														[k: string]: {
															description: string
															type:
																| JsonSchemaType
																| {
																		[k: string]: {
																			[k: string]: unknown
																		}
																  }
														}
													}
													outputs: {
														[k: string]: {
															description: string
															type:
																| JsonSchemaType
																| {
																		[k: string]: {
																			[k: string]: unknown
																		}
																  }
														}
													}
												}
										  }
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
								[k: string]: {
									description: string
									type:
										| JsonSchemaType
										| {
												[k: string]: {
													[k: string]: unknown
												}
										  }
									source: string
									target: string
								}
							}
							inputs: {
								[k: string]: {
									description: string
									type:
										| JsonSchemaType
										| {
												[k: string]: {
													[k: string]: unknown
												}
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
							inputs: {
								[k: string]: {
									description: string
									type:
										| JsonSchemaType
										| {
												[k: string]: {
													[k: string]: unknown
												}
										  }
								}
							}
							outputs: {
								[k: string]: {
									description: string
									type:
										| JsonSchemaType
										| {
												[k: string]: {
													[k: string]: unknown
												}
										  }
								}
							}
						}
				  }
				| {
						id?: UUID
						resource: 'agent/v1'
						meta: Meta & { starred: boolean }
						spec: {
							model: 'mistral/mistral-medium-latest'
							readme: string
							prompts: {
								system: {
									type: 'template'
									value: string
								}[]
								user: {
									type: 'template'
									value: string
								}[]
							}
							settings: {
								temperature: number
								topP: number
								maxTokens: number
							}
							nodes: {
								[k: string]: {
									component_id: UUID
									inputs: {
										[k: string]: {
											source: 'parent'
											target: string
										}
									}
									order: number
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
														[k: string]: {
															description: string
															type:
																| JsonSchemaType
																| {
																		[k: string]: {
																			[k: string]: unknown
																		}
																  }
															source: string
															target: string
														}
													}
													inputs: {
														[k: string]: {
															description: string
															type:
																| JsonSchemaType
																| {
																		[k: string]: {
																			[k: string]: unknown
																		}
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
													inputs: {
														[k: string]: {
															description: string
															type:
																| JsonSchemaType
																| {
																		[k: string]: {
																			[k: string]: unknown
																		}
																  }
														}
													}
													outputs: {
														[k: string]: {
															description: string
															type:
																| JsonSchemaType
																| {
																		[k: string]: {
																			[k: string]: unknown
																		}
																  }
														}
													}
												}
										  }
										| {
												id?: UUID
												resource: 'agent/v1'
												meta: Meta & { starred: boolean }
												spec: {
													model: 'mistral/mistral-medium-latest'
													readme: string
													prompts: {
														system: {
															type: 'template'
															value: string
														}[]
														user: {
															type: 'template'
															value: string
														}[]
													}
													settings: {
														temperature: number
														topP: number
														maxTokens: number
													}
													nodes: {
														[k: string]: {
															component_id: UUID
															inputs: {
																[k: string]: {
																	source: 'parent'
																	target: string
																}
															}
															order: number
														}
													}
													inputs: {
														[k: string]: {
															description: string
															type:
																| JsonSchemaType
																| {
																		[k: string]: {
																			[k: string]: unknown
																		}
																  }
														}
													}
													outputs: {
														[k: string]: {
															description: string
															type:
																| JsonSchemaType
																| {
																		[k: string]: {
																			[k: string]: unknown
																		}
																  }
														}
													}
												}
										  }
								}
							}
							inputs: {
								[k: string]: {
									description: string
									type:
										| JsonSchemaType
										| {
												[k: string]: {
													[k: string]: unknown
												}
										  }
								}
							}
							outputs: {
								[k: string]: {
									description: string
									type:
										| JsonSchemaType
										| {
												[k: string]: {
													[k: string]: unknown
												}
										  }
								}
							}
						}
				  }
			triggers: {
				[k: string]:
					| {
							resource: 'endpoint/v1'
							meta: Omit<Meta, 'intention'>
							spec: {
								method: 'POST'
								payload_mapping: {
									[k: string]: string
								}
								ingress_tokens: string[]
							}
					  }
					| {
							resource: 'cron/v1'
							meta: Omit<Meta, 'intention'>
							spec: {
								schedule: string
								timezone: string
								payload: {
									[k: string]: unknown
								}
							}
					  }
			}
			order: number
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
					secret: false
				}
			}
		}[]
	}
}
export interface TriggerMeta {
	name: string
}
export type Trigger =
	| {
			resource: 'endpoint/v1'
			meta: Omit<Meta, 'intention'>
			spec: {
				method: 'POST'
				payload_mapping: {
					[k: string]: string
				}
				ingress_tokens: string[]
			}
	  }
	| {
			resource: 'cron/v1'
			meta: Omit<Meta, 'intention'>
			spec: {
				schedule: string
				timezone: string
				payload: {
					[k: string]: unknown
				}
			}
	  }
export interface Variable {
	id?: UUID
	resource: 'variable/v1'
	meta: Meta
	spec: {
		key: string
		value: string
		secret: false
	}
}
export interface VariableSpec {
	key: string
	value: string
	secret: false
}

// ──────────────────────
// Type Guard Functions
// ──────────────────────

export const isFlow = (
	component: Component | ResolvedComponent
): component is Flow | ResolvedFlow => component.resource === 'flow/v1'

export const isAction = (component: Component | ResolvedComponent): component is Action =>
	component.resource === 'action/v1'

export const isAgent = (
	component: Component | ResolvedComponent
): component is Agent | ResolvedAgent => component.resource === 'agent/v1'

export type { UUID }
