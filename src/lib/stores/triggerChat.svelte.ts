import type { chatTriggerUserMessageModel } from '$lib/schemas/chat'
import type * as z from 'zod'

type Thread = import('$lib/actions/chat').Thread

export const threads = $state<Thread[]>([])

export const setThreads = (newThreads: Thread[]) => {
  threads.length = 0
  threads.push(...newThreads)
}

class SelectedTools {
  #tools = $state<z.infer<typeof chatTriggerUserMessageModel>['data']['tools']>([])

  get tools() {
    return this.#tools
  }

  set tools(tools: z.infer<typeof chatTriggerUserMessageModel>['data']['tools']) {
    this.#tools = tools
  }
}

export const selectedTools = new SelectedTools()