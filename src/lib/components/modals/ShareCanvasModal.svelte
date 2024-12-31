<script lang="ts">
  /*
    Example implementation of the modal component
  */

  import Modal from '../common/Modal.svelte'
  import { ModalId } from '$lib/stores/modals.svelte'

  const id = ModalId.ShareCanvasModal
</script>

{#snippet header()}
  Share Canvas
{/snippet}

{#snippet body()}
  <div class="flex items-center gap-x-4">
    <button
      class={`flex items-center justify-center flex-shrink-0 gap-x-3 px-4 py-2.5 text-sm font-medium text-brand-tertiary-gray hover:text-white transition duration-200 ease-in-out border rounded-lg bg-white/5 border-brand-primary-gray hover:border-brand-light-gray`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
        />
      </svg>
      <span>Copy Link</span>
    </button>
    <div class="relative w-full">
      <input
        id="invite-link"
        type="text"
        placeholder="Invite users by name or email..."
        class="w-full px-4 py-2.5 text-md bg-[#1D1E1F] border rounded-lg border-brand-primary-gray"
      />
      <button
        class={`w-fit absolute ml-auto inset-0 px-4 py-2.5 text-md font-medium text-brand-tertiary-gray hover:text-white transition duration-200 ease-in-out border rounded-y-lg rounded-r-lg bg-[#262728] hover:bg-white/10 border-brand-primary-gray`}
      >
        Invite
      </button>
    </div>
  </div>
  <div>
    <div class="flex items-center pt-8">
      <img alt="profile logo" src="https://picsum.photos/100" class="w-8 mr-3 rounded-full" />
      <h4 class="text-sm text-white">Iggy</h4>
      <select
        id="Label"
        placeholder="Type here..."
        class="px-4 py-3 w-[15rem] ml-auto border rounded-md bg-[#1D1E1F] border-brand-primary-gray"
      >
        <option>Admin</option>
        <option>Admin 2</option>
        <option>Admin 3</option>
      </select>
    </div>
    <div class="flex items-center pt-8">
      <img alt="profile logo" src="https://picsum.photos/100" class="w-8 mr-3 rounded-full" />
      <h4 class="text-sm text-white">Iggy</h4>
      <select
        id="Label"
        placeholder="Type here..."
        class="px-4 py-3 w-[15rem] ml-auto border rounded-md bg-[#1D1E1F] border-brand-primary-gray"
      >
        <option>Admin</option>
        <option>Admin 2</option>
        <option>Admin 3</option>
      </select>
    </div>
    <div class="flex items-center pt-8">
      <img alt="profile logo" src="https://picsum.photos/100" class="w-8 mr-3 rounded-full" />
      <h4 class="text-sm text-white">Iggy</h4>
      <select
        id="Label"
        placeholder="Type here..."
        class="px-4 py-3 w-[15rem] ml-auto border rounded-md bg-[#1D1E1F] border-brand-primary-gray"
      >
        <option>Admin</option>
        <option>Admin 2</option>
        <option>Admin 3</option>
      </select>
    </div>
  </div>
{/snippet}

<Modal
  {id}
  {body}
  {header}
/>

