<script>
	import { marked } from 'marked'

	export let data
	export let form

	// console.log(data)

	let add
	let path = ''
</script>

<button on:click={() => (add = !add)}>Add</button>

{#if add}
	<form method="POST">
		<label>
			URL
			<input name="repo" placeholder="Repo or RSS Url" required />
		</label>
		<label>
			Path
			<input name="path" placeholder="Path to changelog.md" bind:this={path} />
		</label>
		<label>
			Title
			<input name="title" placeholder="Title" />
		</label>
		{#if path.length}
			<label>
				Hide H1
				<input name="hideH1" placeholder="Hide H1 in changelog.md" type="checkbox" />
			</label>
		{/if}
		<button>Verify & Save</button>
	</form>
{/if}
{#if form?.title}
	<div class="header">
		<h1 class="title"><a href={form.href} target="_blank">{form.title}</a></h1>
		<small class="subtitle">{form.changelog ? 'Changelog' : 'Releases'}</small>
	</div>
	<div class="main" class:hideH1={form.hideH1}>
		{@html marked(form.body)}
	</div>
{/if}
{#if data.items.length}
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
{/if}

<style lang="scss">
</style>
