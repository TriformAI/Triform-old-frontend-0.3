import { SvelteSet } from "svelte/reactivity"

export enum ModalId {
  ShareCanvas = 'shareCanvas'
}

export const activeModals = $state<SvelteSet<ModalId>>(new SvelteSet())

export const openModal = (modalId: ModalId) => {
  // For now only one modal can be open at a time,
  // though it's easy to allow more than one, just
  // need some sort of z-indexing
  activeModals.clear()
  activeModals.add(modalId)
}

export const closeModal = (modalId: ModalId) => {
  activeModals.delete(modalId)
}