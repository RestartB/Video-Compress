import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '$env/static/private';

import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { token } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ url, locals, cookies }) => {
	if (!locals.token) {
		return redirect(303, '/');
	}

	if (locals.discordToken) {
		const newRequest = await fetch('https://discord.com/api/oauth2/token/revoke', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				client_id: DISCORD_CLIENT_ID ?? '',
				client_secret: DISCORD_CLIENT_SECRET ?? '',
				token: locals.discordToken,
				token_type_hint: 'access_token'
			})
		});

		if (!newRequest.ok) {
			console.log(newRequest.status, 'Failed to revoke token');
		}

		console.log('Revoked Discord token');
	}

	await db.delete(token).where(eq(token.token, locals.token)).run();

	cookies.delete('video_token', { path: '/' });
	cookies.delete('video_state', { path: '/' });

	console.log('Deleted cookies');

	// check for reenter query param
	const reenter = url.searchParams.get('reenter');

	if (reenter) {
		return redirect(303, '/auth/login?redirect=' + encodeURIComponent(reenter));
	}

	return redirect(303, '/');
};
