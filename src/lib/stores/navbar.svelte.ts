let activeBuildPath = $state('/dashboard')
export const getActiveBuildPath = () => activeBuildPath
export const setActiveBuildPath = (path: string) => (activeBuildPath = path)