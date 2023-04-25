<script>
	import { marked } from 'marked'
	import { invalidateAll } from '$app/navigation'
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'

	export let data

	let loading

	const refresh = async () => {
		loading = true
		document.hidden || (await invalidateAll())
		loading = false
	}

	onMount(() => {
		document.addEventListener('visibilitychange', refresh)

		return () => document.removeEventListener('visibilitychange', refresh)
	})
</script>

<section class="row">
	{#each data.items as { title, href, body, hideH1, changelog }}
		<div class="col">
			<div class="header">
				<h1 class="title"><a {href} target="_blank">{title}</a></h1>
				<small class="subtitle">{changelog ? 'Changelog' : 'Releases'}</small>
			</div>
			<div class="main" class:hideH1>
				{@html marked(body)}
			</div>
		</div>
	{/each}
</section>

{#if loading}
	<div class="loading" in:fly={{ y: 100 }} out:fly={{ y: -100, delay: 500 }}>
		<img class="spin" src="/load.gif" alt="loader" />
		Loading...
	</div>
{/if}

<style lang="scss">
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(min(28rem, 100%), 1fr);
		gap: 1rem;
		padding: 1rem;
		overflow: auto;
	}

	.col {
		background-color: hsl(240 2% 9%);
		border-radius: 24px;
		border: 0.5px solid hsl(0 0% 100% / 0.15);
		max-height: calc(100vh - 2rem);
		overflow: auto;
	}

	.header {
		background-color: hsl(240 2% 9% / 0.8);
		backdrop-filter: saturate(180%) blur(20px);
		-webkit-backdrop-filter: saturate(180%) blur(20px);
		border-bottom: 0.5px solid #666;
		padding: 1rem 1.5rem;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.title {
		margin: 0;
	}

	.subtitle {
		color: #666;
		font-style: italic;
		font-weight: 500;
	}

	.main {
		padding: 1rem 1.5rem;

		&.hideH1 :global(h1:not(.title)) {
			display: none;
		}

		:global(li) {
			overflow-wrap: break-word;
		}

		:global(li p) {
			margin: 0;
		}

		:global(h2) {
			background-color: hsl(240 2% 9%);
			position: sticky;
			top: 90.5px;
			z-index: 1;
		}
	}

	.loading {
		align-items: center;
		background-color: hsl(0 0% 0% / 0.2);
		backdrop-filter: blur(40px);
		border-radius: 20px;
		box-shadow: 0 10px 40px hsl(0 0% 0% / 0.2), 0 2px 10px hsl(0 0% 0% / 0.2);
		border: 0.5px solid hsl(0 0% 100% / 0.25);
		display: flex;
		inset: 50% 50% auto auto;
		gap: 0.75rem;
		padding: 1.25rem 1.75rem;
		position: fixed;
		transform: translate(-50%, -50%);
		z-index: 1;
	}

	.spin {
		height: 1.25rem;
		mix-blend-mode: overlay;
		width: 1.25rem;
	}
</style>
