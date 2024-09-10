<script>
	import { marked } from 'marked'
	import { invalidateAll } from '$app/navigation'
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'

	export let data

	// console.log(data)

	let loading
	let mounted

	const refresh = async () => {
		loading = true
		document.hidden || (await invalidateAll())
		loading = false
	}

	onMount(() => {
		mounted = true
		document.addEventListener('visibilitychange', refresh)

		return () => document.removeEventListener('visibilitychange', refresh)
	})
</script>

<section class="row">
	{#each data.items as item}
		{#if item}
			<div class="col">
				<div class="header">
					<div class="over">
						<h1 class="title"><a href={item.href} target="_blank">{item.title}</a></h1>
						<small class="subtitle">{item.rss ? 'RSS' : item.changelog ? 'Changelog' : 'Releases'}</small>
					</div>
					<div class="under">
						{#if item.mile}
							<progress
								class="progress"
								class:initial={!mounted}
								value={item.mile.percent}
								min={0}
								max={100}
							></progress>
							<a class="link" href="{item.href}/milestone/{item.mile.number}" target="_blank">
								<small class="subtitle" title="Title, Open, Closed, Percent">
									{item.mile.title}&nbsp;&nbsp;&nbsp;&nbsp;O {item.mile.open}&nbsp;&nbsp;&nbsp;&nbsp;C {item
										.mile.closed}&nbsp;&nbsp;&nbsp;&nbsp;{item.mile.percent}%
								</small>
							</a>
						{/if}
					</div>
				</div>
				<div class="main" class:hideH1={item.hideH1}>
					{#if item.body}
						{@const text = item.body
							.replace(/<template>/g, '&lt;template&gt;')
							.replace(/<\/template>/g, '&lt;/template&gt;')}
						{@html marked(text)}
					{:else if item.content}
						{#each item.content as content}
							<div>
								<h2><a href={content.href} target="_blank">{content.title}</a></h2>
								<div>{content.body}</div>
								<br />
							</div>
						{/each}
					{:else}
						Failed
					{/if}
				</div>
			</div>
		{/if}
	{/each}
</section>

{#if loading}
	<div class="loading" in:fly|global={{ y: 50 }} out:fly|global={{ y: -50, delay: 500 }}>
		<img class="spin" src="/load.gif" alt="loader" />
		Fetching...
	</div>
{/if}

<style lang="scss">
	.row {
		display: grid;
		grid-auto-columns: minmax(94%, 1fr);
		grid-auto-flow: column;
		height: 100vh;

		@include mq($from: tablet) {
			gap: 1rem;
			grid-auto-flow: row;
			grid-template: repeat(2, minmax(0, 1fr)) / repeat(3, minmax(0, 1fr));
			overflow: auto;
			padding: 1rem;
		}
	}

	.col {
		background-color: hsl(240 2% 9%);
		border: 0.5px solid hsl(0 0% 100% / 0.15);
		overflow: auto;

		@include mq($from: tablet) {
			border-radius: 24px;
			max-height: calc(100vh - 2rem);
		}
	}

	.header {
		align-items: end;
		background-color: hsl(240 2% 9% / 0.8);
		backdrop-filter: saturate(180%) blur(20px);
		-webkit-backdrop-filter: saturate(180%) blur(20px);
		border-bottom: 0.5px solid #666;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		position: sticky;
		top: 0;
		z-index: 2;

		@include mq($from: tablet) {
			flex-direction: row;
			gap: 0;
		}
	}

	.over,
	.under {
		width: 100%;

		@include mq($from: tablet) {
			width: auto;
		}
	}

	.title {
		font-size: 1.375rem;
		margin: 0;

		@include mq($from: tablet) {
			font-size: 1.5rem;
		}
	}

	.subtitle {
		color: #666;
		font-style: italic;
		font-weight: 500;
		transition: color 0.25s ease;
	}

	.link:hover .subtitle {
		color: #ccc;
	}

	.progress {
		appearance: none;
		background-color: hsl(0 0% 0%);
		border: 0;
		border-radius: 0.5rem;
		height: 0.375rem;
		width: 100%;

		@include mq($from: tablet) {
			margin: 0 0 0.5rem;
		}

		&::-webkit-progress-bar {
			background-color: hsl(0 0% 25%);
			border: 1px solid black;
			border-radius: 0.5rem;
		}

		&::-webkit-progress-value {
			background-color: hsl(150 100% 40%);
			box-shadow: 0 1px 12px hsl(150 100% 50% / 0.75);
			border-radius: 0.5rem;
			transition: inline-size 1s 0.25s cubic-bezier(0.68, -0.6, 0.32, 1.6);
		}

		&.initial::-webkit-progress-value {
			inline-size: 0% !important;
		}
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
			top: 87px;
			z-index: 1;
		}

		:global(h2 a) {
			color: white;
		}
	}

	.loading {
		align-items: center;
		background-color: hsl(0 0% 0% / 0.2);
		backdrop-filter: blur(40px);
		border-radius: 20px;
		box-shadow:
			0 10px 40px hsl(0 0% 0% / 0.2),
			0 2px 10px hsl(0 0% 0% / 0.2);
		border: 0.5px solid hsl(0 0% 100% / 0.25);
		display: flex;
		inset: 50% auto auto 50%;
		gap: 0.75rem;
		padding: 1.5rem 2rem;
		position: fixed;
		transform: translate(-50%, -50%);
		z-index: 10;
	}

	.spin {
		height: 1.25rem;
		mix-blend-mode: overlay;
		width: 1.25rem;
	}
</style>
