import { SvelteKitAuth } from '@auth/sveltekit'
import GitHub from '@auth/core/providers/github'
import { GITHUB_ID, GITHUB_SECRET } from '$env/static/private'
import { sequence } from '@sveltejs/kit/hooks'

let access_token = ''
let profile_id

const auth_handle = SvelteKitAuth({
	providers: [GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET })],
	callbacks: {
		signIn: async params => {
			access_token = params.account.access_token
			profile_id = params.profile.id

			return params
		}
	}
})

const store_token = async ({ event, resolve }) => {
	event.locals.access_token = access_token
	event.locals.profile_id = profile_id

	return await resolve(event)
}

export const handle = sequence(auth_handle, store_token)
