<script lang="ts">
	import type { Snippet } from 'svelte'
  import type { Window } from '$lib/stores/windows.svelte'

  import {
    closeWindowById,
    updateWindowById,
    bringWindowToFront
  } from '$lib/stores/windows.svelte'
	import Card from './Card.svelte'

	let {
		header,
		body,
		footer,
		onClose: onCloseProp,
    posX = 0,
    posY = 0,
    id,
    width = 500,
    height = 500,
    zIndex = 1,
    customProps
	}: {
		header?: Snippet
		body: Snippet
		footer?: Snippet
		onClose?: () => void,
    posX: Window['posX'],
    posY: Window['posY'],
    id: Window['id'],
    width: Window['width'],
    height: Window['height'],
    zIndex: Window['zIndex'],
    customProps: Window['customProps']
	} = $props()

  let element: HTMLDivElement

  const onClose = () => {
    closeWindowById(id)
    onCloseProp?.()
  }

  let dragStart = {
    x: 0,
    y: 0
  }
  let isDragging = $state(false)

  const onDrag = (e: MouseEvent) => {
    // update the local position first and then push the update to the state
    // Convert the mouse position to percentages
    // We'll have to figure out where on the window the mouse grabbed it, and
    // adjust the relative position accordingly
    let { clientX: x, clientY: y } = e
    const {
      clientWidth: width,
      clientHeight: height
    } = element.parentElement as HTMLElement

    // Correct for grab position
    x -= dragStart.x
    y -= dragStart.y

    // Don't allow the element to go out of bounds
    // 4 is how much we want to allow the element to go out of bounds
    if (
      x > (element.clientWidth / -4) &&
      x + (element.clientWidth / 4) < width
    ) posX = (x / width) * 100
    if (
      y > 0 &&
      y + (element.clientHeight / 4) < height
    ) posY = (y / height) * 100

    // Update state
    updateWindowById(id, {
      posX,
      posY
    })
  }

  const onDragStart = (e: MouseEvent) => {
    window.addEventListener('mousemove', onDrag)

    // Offset within the window
    const { offsetLeft, offsetTop } = element
    dragStart = {
      x: e.clientX - offsetLeft,
      y: e.clientY - offsetTop
    }
    isDragging = true

    bringWindowToFront(id)
  }

  const onDragEnd = (e: MouseEvent) => {
    isDragging = false
    window.removeEventListener('mousemove', onDrag)
  }
</script>

<div
  class="absolute {isDragging ? 'shadow-lg scale-[1.015]' : 'scale-100'} transform transition"
  style={`
    top: ${posY}%;
    left: ${posX}%;
    z-index: ${zIndex};
  `}
  bind:this={element}
>
	<Card
    {header}
    {body}
    {footer} 
    {onClose} 
    {onDragStart}
    {onDragEnd}
  />
</div>
