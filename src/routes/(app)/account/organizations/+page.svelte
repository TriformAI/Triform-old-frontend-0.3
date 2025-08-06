<script lang="ts">
	import { authClient } from '$lib/auth-client'
	const organizations = authClient.useListOrganizations()
</script>

<table>
	<thead>
		<tr>
			<th>Name</th>
		</tr>
	</thead>
	<tbody>
		{#if $organizations.data}
			<!-- content here -->
			{#each $organizations.data as org}
				<tr>
					<td>
						<a href={`/account/organizations/${org.id}`} class="flex items-center gap-2">
							<img src={org.logo} alt={org.name} class="size-8 rounded-full object-cover" />
							{org.name}
						</a>
					</td>
				</tr>
			{/each}
		{/if}
	</tbody>
</table>
