import { updateAction } from '$lib/stores/canvas.svelte'

export const publishAction = async (action: any) => {
  console.log('publishing action', action)
  const res = await fetch('https://triform.arcticmarinesolutions.se/v1/action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(action)
  })
  const data = await res.json()
  console.log(data)
  // The return value from the api doesn't include the key, so we
  // need to add the key from the current action
  await updateAction(Object.assign(action, data))
}

export const runAgent = async (invocation: any) => {
  console.log('running agent', invocation)
  const res = await fetch('https://triform.arcticmarinesolutions.se/v1/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(invocation)
  })

  return await res.json()
}