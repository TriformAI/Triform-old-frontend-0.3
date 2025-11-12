import type z from "zod"
import type { socketEventModel } from "$lib/schemas/socket"

let socketId = $state<string>()
export const getSocketId = () => socketId
export const setSocketId = (id: string) => (socketId = id)

const socketListeners = $state<Record<string, (message: z.infer<typeof socketEventModel>) => void>>({})

export const addSocketListener = (listener: (message: z.infer<typeof socketEventModel>) => void) => {
  const id = crypto.randomUUID()
  socketListeners[id] = listener
  return () => delete socketListeners[id]
}

export const onSocketMessage = (message: z.infer<typeof socketEventModel>) => {
  for (const listener of Object.values(socketListeners)) listener(message)
}