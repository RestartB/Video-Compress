import { redirect } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

import { DISCORD_CLIENT_ID, MODE } from '$env/static/private';

export const GET: RequestHandler = async ({ locals, url, cookies }) => {
	if (locals.token) {
		throw redirect(303, '/');
	}

	// get redirect from url arg
	const redirectTo = url.searchParams.get('redirect');

	// date - random chars - redirect stored in base64
	const state = `${Date.now()}-${Math.random().toString(36).substring(2)}-${redirectTo ? btoa(encodeURIComponent(redirectTo)) : ''}`;
	cookies.set('video_state', state, {
		path: '/',
		sameSite: 'strict',
		secure: MODE.toLowerCase() === 'production',
		maxAge: 600,
		httpOnly: false
	});

	throw redirect(
		307,
		`https://discord.com/oauth2/authorize?response_type=code&client_id=${DISCORD_CLIENT_ID}&scope=identify%20guilds&state=${state}&redirect_uri=${encodeURIComponent(`${url.origin}/discord/callback`)}`
	);
};
