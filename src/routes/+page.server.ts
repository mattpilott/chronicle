import type { PageServerLoad } from './$types'
import { Octokit } from 'octokit'
import rss2js from 'rss-to-json'
import { GITHUB_TOKEN } from '$env/static/private'

const CACHE_TTL_MS = import.meta.env.DEV ? 10 * 60 * 1000 : 5 * 60 * 1000 // 10 min dev, 5 min prod
let cache: { items: object[]; ts: number } | null = null

// prettier-ignore
const { rest: { repos: { getContent, listReleases, listCommits }, issues: { getMilestone } } } = new Octokit({
	auth: GITHUB_TOKEN
})

const githubs = [
	{
		owner: 'sveltejs',
		repo: 'svelte',
		path: 'packages/svelte/CHANGELOG.md',
		hideH1: true,
		milestone_number: 10
	},
	{ owner: 'sveltejs', repo: 'kit', path: 'packages/kit/CHANGELOG.md', hideH1: true, milestone_number: 7 },
	{ owner: 'vitejs', repo: 'vite', path: 'packages/vite/CHANGELOG.md', hideH1: true, milestone_number: 28 },
	{
		rss: 'https://www.figma.com/release-notes/feed/atom.xml',
		title: 'Figma',
		href: 'https://www.figma.com/release-notes',
		per_page: 8
	},
	{
		rss: 'https://www.storyblok.com/rss/changelog',
		title: 'Storyblok',
		href: 'https://www.storyblok.com/changelog',
		per_page: 8
	},
	{ rss: 'https://webkit.org/rss', title: 'Webkit', href: 'https://webkit.org', per_page: 8 }
]

function summary(str, delimit = '\n## ', count = 10) {
	return str.split(delimit).slice(0, count).join(delimit)
}

function fromB64(str) {
	return Buffer.from(str, 'base64').toString()
}

export const load = (async () => {
	if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
		return { items: cache.items }
	}

	const results = await Promise.allSettled(
		githubs.map(async github => {
			if (github.rss) {
				const result = await rss2js.parse(github.rss)
				const data = []

				result.items.slice(0, github.per_page).forEach(item => {
					data.push({
						body: item.description || item.content,
						href: item.link,
						title: item.title,
						date: item.pubDate || item.updated || null
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
			} else {
				// Fetch changelog content or releases
				const { data } = github.path ? await getContent(github) : await listReleases(github)

				let lastModified = null
				if (github.path) {
					try {
						const { data: commits } = await listCommits({
							owner: github.owner,
							repo: github.repo,
							path: github.path,
							per_page: 1
						})
						lastModified = commits[0]?.commit?.committer?.date || null
					} catch (e) {
						lastModified = null
					}
				}

				const { data: mile } = github.milestone_number ? await getMilestone(github) : { data: false }
				const body = github.path
					? summary(fromB64(data.content), '\n## ', github.per_page)
					: data.map(i => i.body).join('\n\n')

				return {
					title: `@${github.owner}/${github.repo}`,
					href: `https://github.com/${github.owner}/${github.repo}`,
					body,
					lastModified,
					hideH1: github.hideH1,
					changelog: github.path,
					mile: mile && {
						number: github.milestone_number,
						title: mile.title,
						open: mile.open_issues,
						closed: mile.closed_issues,
						percent: Math.floor((mile.closed_issues / (mile.open_issues + mile.closed_issues)) * 100)
					}
				}
			}
		})
	)

	const items = results
		.filter(r => r.status === 'fulfilled' && r.value != null)
		.map(r => (r as PromiseFulfilledResult<object>).value)

	if (items.length > 0) {
		cache = { items, ts: Date.now() }
	}
	return { items }
}) satisfies PageServerLoad
