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
  console.log('full', fullSpec)
  const spec = (JSON.parse(JSON.stringify(fullSpec))).spec.agent

  // We need to construct the actual action spec
  const modifiedSpec = await new Promise<any>(resolve => processSpec(
    spec,
    (s: any) => {
      console.log('spec', s)
      if (s.resource === 'action') {
        s.id = s.spec.id
        console.log('s', s)
        delete s.spec
      }
    },
    resolve
  ))
  console.log('modified', modifiedSpec)
  const newSpec = Object.assign({}, fullSpec, {
    spec: {
      name: fullSpec.spec.name,
      version: fullSpec.spec.version,
      agent: modifiedSpec
    }
  })
  console.log('new spec', newSpec)

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