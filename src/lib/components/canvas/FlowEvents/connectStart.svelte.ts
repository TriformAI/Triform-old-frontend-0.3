import type { OnConnectStart } from "@xyflow/svelte"
import { canvasState } from "$lib/stores/canvas.svelte"

export const onconnectstart: OnConnectStart = (event, params) => {
	canvasState.connecting = true
  if (!params.nodeId || !params.handleId || !params.handleType) return
	canvasState.connectingFrom = {
    nodeId: params.nodeId,
    handleId: params.handleId,
    handleType: params.handleType
  }
}