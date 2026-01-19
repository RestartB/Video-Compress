import { error, json } from '@sveltejs/kit';
import { TITANIUM_API_URL, DISCORD_GUILD_ID } from '$env/static/private';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.token) {
		return error(403, 'Forbidden');
	}

	const request = await fetch(
		`${TITANIUM_API_URL}/user/${locals.discordId}/inguild/${DISCORD_GUILD_ID}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);

	if (!request.ok) {
		console.error(request.statusText);
		error(request.status, 'Failed to fetch info from Titanium server');
	}

	const data = await request.json();
	return json(data);
};
