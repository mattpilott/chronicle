import { Octokit } from 'octokit'
import { JSDOM } from 'jsdom'

// prettier-ignore
const { rest: { repos: { getContent, listReleases } } } = new Octokit({
	auth: import.meta.env.VITE_KEY
})

const githubs = [
	{ owner: 'sveltejs', repo: 'svelte', path: 'packages/svelte/CHANGELOG.md', hideH1: true },
	{ owner: 'sveltejs', repo: 'kit', path: 'packages/kit/CHANGELOG.md', hideH1: true },
	{ rss: 'https://webkit.org/rss', title: 'Webkit', href: 'https://webkit.org', per_page: 10 },
	{ owner: 'storyblok', repo: 'storyblok-js', per_page: 10 },
	{ owner: 'storyblok', repo: 'storyblok-svelte', per_page: 10 },
	{
		rss: 'https://www.storyblok.com/rss/changelog',
		title: 'Storyblok',
		href: 'https://www.storyblok.com/changelog',
		per_page: 10
	}
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
			if (github.rss) {
				try {
					const xml = await fetch(github.rss).then(r => r.text())
					// prettier-ignore
					const { window: { document } } = new JSDOM(xml, { contentType: 'text/xml' })
					const data = []

					document.querySelectorAll('item').forEach(item => {
						data.push({
							body: item.querySelector('description').textContent,
							href: item.querySelector('link').textContent,
							title: item.querySelector('title').textContent
						})
					})

					return {
						title: github.title,
						href: github.href,
						body: data.map(i => i.body).join('\n\n'),
						hideH1: false,
						changelog: false,
						rss: true
					}
				} catch (e) {
					return
				}
			} else {
				const { data } = github.path ? await getContent(github) : await listReleases(github)

				return {
					title: `@${github.owner}/${github.repo}`,
					href: `https://github.com/${github.owner}/${github.repo}`,
					body: github.path
						? summary(fromB64(data.content), github.per_page)
						: data.map(i => i.body).join('\n\n'),
					hideH1: github.hideH1,
					changelog: github.path
				}
			}
		})
	)

	return { items }
}
