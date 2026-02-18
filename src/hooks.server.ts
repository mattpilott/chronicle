import { sequence } from '@sveltejs/kit/hooks'
import { env } from '$env/dynamic/private'
import { SvelteKitAuth } from '@auth/sveltekit'
import GitHub from '@auth/sveltekit/providers/github'
import { GITHUB_ID, GITHUB_SECRET } from '$env/static/private'

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

const security_headers = async ({ event, resolve }) => {
	const response = await resolve(event)

	response.headers.set('Cache-Control', 'no-cache')
	response.headers.set('Content-Security-Policy', "frame-ancestors 'self'")
	response.headers.set('Permissions-Policy', 'fullscreen=*')
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
	response.headers.set('X-Content-Type-Options', 'nosniff')
	response.headers.set('X-Frame-Options', 'SAMEORIGIN')

	return response
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error }) {
	return {
		message: env.ENVIRONMENT !== 'production' ? error.message : 'Whoa there!',
		code: error?.code ?? 'UNKNOWN',
		env: env.ENVIRONMENT
	}
}

export const handle = sequence(auth_handle.handle, store_token, security_headers)
