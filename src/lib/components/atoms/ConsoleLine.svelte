<script>
	import cn from 'classnames'
	var { type = 'normal', children } = $props()
</script>

<pre
	class={cn({
		'text-primary-red': type === 'error',
		'text-primary-yellow': type === 'warning'
	})}>{@render children?.()}</pre>
