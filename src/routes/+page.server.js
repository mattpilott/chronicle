import { Octokit } from 'octokit'

// prettier-ignore
const { rest: { repos: { getContent, listReleases } } } = new Octokit({
	auth: import.meta.env.VITE_KEY
})

const githubs = [
	{ owner: 'sveltejs', repo: 'kit', path: 'packages/kit/CHANGELOG.md', hideH1: true },
	{ owner: 'sveltejs', repo: 'svelte', path: 'CHANGELOG.md', hideH1: true },
	{ owner: 'storyblok', repo: 'storyblok-svelte', per_page: 10 }
]

function summary(str, delimit = '\n## ', count = 10) {
	return str.split(delimit).slice(0, count).join(delimit)
}

function fromB64(str) {
	return Buffer.from(str, 'base64').toString()
}

export async function load() {
	const items = await Promise.all(
		githubs.map(async github => {
			const { data } = github.path ? await getContent(github) : await listReleases(github)

			return {
				title: `@${github.owner}/${github.repo}`,
				href: `https://github.com/${github.owner}/${github.repo}`,
				body: github.path ? summary(fromB64(data.content)) : data.map(i => i.body).join('\n\n'),
				hideH1: github.hideH1,
				changelog: github.path
			}
		})
	)

	return { items }
}
