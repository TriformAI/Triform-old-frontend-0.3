import { updateAction, processSpec } from '$lib/stores/canvas.svelte'

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
  return await updateAction(Object.assign(action, data))
}

export const runAgent = async (fullSpec: any, input: any) => {
  const agentName = fullSpec.spec.name
  const agentVersion = fullSpec.spec.version
  const agentSpec = JSON.parse(JSON.stringify(fullSpec.spec.agent))

  const modifiedSpec = await new Promise<any>(resolve => processSpec(
    agentSpec,
    (s: any) => {
      if (s.resource === 'action') {
        // Move the id from the spec to the resource as that's what the api expects
        s.id = s.spec.id
        // Delete the rest of the spec as it's not needed for invocation
        delete s.spec
      }
    },
    resolve
  ))

  // Use the new spec
  const newSpec = {
    ...fullSpec,
    spec: {
      name: agentName,
      version: agentVersion,
      agent: modifiedSpec
    }
  }

  // Construct the actual invocation request
  const invocation = {
    resource: 'invocation',
    api_version: 'v1',
    input,
    turbo: true,
    spec: newSpec
  }
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