import type { chatTriggerUserMessageModel } from '$lib/schemas/chat'
import type * as z from 'zod'
import { type Thread } from '$lib/actions/chat'

export const threads = $state<Thread[]>([])

export const setThreads = (newThreads: Thread[]) => {
  threads.length = 0
  threads.push(...newThreads)
}

class SelectedTools {
  #tools = $state<z.infer<typeof chatTriggerUserMessageModel>['data']['tools']>([])
  #storageKey = 'triggerChat__selectedTools'

  get tools() {
    return this.#tools
  }

  set tools(tools: z.infer<typeof chatTriggerUserMessageModel>['data']['tools']) {
    this.#tools = tools
    if (typeof window === 'undefined') return
    localStorage.setItem(this.#storageKey, JSON.stringify(tools))
  }

  constructor() {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem(this.#storageKey)
      if (!stored) return
      const tools = JSON.parse(stored)
      if (!Array.isArray(tools)) {
        console.warn('Stored tools wasnt an array')
        return
      }
      this.#tools = tools
    } catch (err) {
      console.error('Error loading tools from localStorage', err)
    }
  }

  cleanTools(availableTools: z.infer<typeof chatTriggerUserMessageModel>['data']['tools']) {
    this.tools = this.#tools.filter(tool => availableTools.some(t => t.projectId === tool.projectId && t.nodeId === tool.nodeId))
  }
}

export const selectedTools = new SelectedTools()