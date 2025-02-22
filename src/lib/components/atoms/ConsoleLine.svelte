<script>
	var { type = 'normal', children } = $props()
</script>

<pre
	class={[
		type === 'error' && 'text-rose',
		type === 'warning' && 'text-warning-400'
	]}>{@render children?.()}</pre>
