type Thread = import('$lib/actions/chat').Thread

export const threads = $state<Thread[]>([])

export const setThreads = (newThreads: Thread[]) => {
  threads.length = 0
  threads.push(...newThreads)
}