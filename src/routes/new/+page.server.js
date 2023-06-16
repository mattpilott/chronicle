import { Octokit } from 'octokit'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_PROJECT_URL, SUPABASE_API_KEY } from '$env/static/private'

const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_API_KEY)

function summary(str, delimit = '\n## ', count = 10) {
	return str.split(delimit).slice(0, count).join(delimit)
}

function fromB64(str) {
	return Buffer.from(str, 'base64').toString()
}

export async function load({ locals: { access_token: auth, github_user_id }, cookies }) {
	// prettier-ignore
	const { rest: { repos: { getContent, listReleases } } } = new Octokit({ auth })
	const chronicles = await supabase.from('Chronicles').select('*').eq('github_user_id', github_user_id)
	const cooks = cookies.getAll().filter(i => i.name.startsWith('chronicle_'))
	const items = await Promise.all(
		cooks.map(async cookie => {
			const github = JSON.parse(cookie.value)
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

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ locals: { access_token: auth, github_user_id }, cookies, request }) => {
		// prettier-ignore
		const { rest: { repos: { getContent, listReleases } } } = new Octokit({ auth })
		const formdata = await request.formData()
		const url = formdata.get('repo')
		const path = formdata.get('path')
		const title = formdata.get('title')
		const hideH1 = formdata.get('hideH1')
		const match = url.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/)

		// await supabase
		// 	.from('Chronicles')
		// 	.insert([{ title: 'Foo', url: 'httpS://google.com', hide_h1: true, github_user_id: 'matt-12345' }])
		// 	.then(console.log)
		// 	.catch(console.error)
		if (match) {
			const owner = match[1]
			const repo = match[2]
			const { data } = path ? await getContent({ owner, repo }) : await listReleases({ owner, repo })

			return {
				title: title || `@${owner}/${repo}`,
				href: `https://github.com/${owner}/${repo}`,
				body: path ? summary(fromB64(data.content)) : data.map(i => i.body).join('\n\n'),
				hideH1,
				changelog: path
			}
		}
	}
}
