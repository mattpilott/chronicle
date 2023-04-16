<script>
	import { marked } from 'marked'

	export let data
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

<style lang="scss">
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(30rem, 1fr);
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
		padding: 1rem 2rem;
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
		padding: 1rem 2rem;

		&.hideH1 :global(h1:not(.title)) {
			display: none;
		}

		:global(li p) {
			margin: 0;
		}

		:global(h2) {
			background-color: hsl(240 2% 9%);
			position: sticky;
			top: 100px;
			z-index: 1;
		}
	}
</style>
