let socketId = $state<string>()
export const getSocketId = () => socketId
export const setSocketId = (id: string) => (socketId = id)
