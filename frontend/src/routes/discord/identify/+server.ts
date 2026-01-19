import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { token } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({locals}) => {
	if (!locals.token) {
		return error(403, 'Forbidden');
	}

	const request = await fetch('https://discord.com/api/users/@me', {
		headers: {
			Authorization: `Bearer ${locals.discordToken}`
		}
	});

	if (request.status === 401) {
		if (locals.discordToken) {
			await db.delete(token).where(eq(token.discordToken, locals.discordToken)).run();
		}
		throw error(401, 'Unauthorized');
	}

	if (!request.ok) {
		console.error('Failed to fetch user data from Discord:', await request.text());
		throw error(request.status, 'Failed to fetch user data from Discord');
	}

	const userData = await request.json();
	return json({ userData });
};
