<script>
	var { type = 'normal', children } = $props()
</script>

<pre
	class={[
		type === 'error' && 'text-primary-red',
		type === 'warning' && 'text-primary-yellow'
	]}>{@render children?.()}</pre>
