import { Octokit } from 'octokit'
import rss2js from 'rss-to-json'

// prettier-ignore
const { rest: { repos: { getContent, listReleases } } } = new Octokit({
	auth: import.meta.env.VITE_KEY
})

const githubs = [
	{ owner: 'sveltejs', repo: 'svelte', path: 'packages/svelte/CHANGELOG.md', hideH1: true },
	{ owner: 'sveltejs', repo: 'kit', path: 'packages/kit/CHANGELOG.md', hideH1: true },
	{
		rss: 'https://www.figma.com/release-notes/feed/atom.xml',
		title: 'Figma',
		href: 'https://www.figma.com/release-notes',
		per_page: 10
	},
	{ owner: 'storyblok', repo: 'storyblok-js', per_page: 10 },
	{
		rss: 'https://www.storyblok.com/rss/changelog',
		title: 'Storyblok',
		href: 'https://www.storyblok.com/changelog',
		per_page: 10
	},
	{ rss: 'https://webkit.org/rss', title: 'Webkit', href: 'https://webkit.org', per_page: 10 }
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
					const result = await rss2js.parse(github.rss)
					const data = []

					result.items.slice(0, github.per_page).forEach(item => {
						data.push({
							body: item.description || item.content,
							href: item.link,
							title: item.title
						})
					})

					return {
						title: github.title,
						href: github.href,
						content: data,
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
