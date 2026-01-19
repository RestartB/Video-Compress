import { redirect } from '@sveltejs/kit';
import { checkToken } from '$lib/server/token';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	console.log(`Handling request for ${event.url.pathname}`);

	event.setHeaders({
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'SAMEORIGIN',
		'Strict-Transport-Security': 'max-age=604800; includeSubDomains'
	});

	// token and guild check
	const token = await checkToken(event);
	if (token) {
		if (!event.url.pathname.startsWith('/discord/')) {
			const inGuildRequest = await event.fetch('/discord/guild-check');
			if (!inGuildRequest.ok) {
				event.locals.inGuild = false;
			}

			const inGuildData = await inGuildRequest.json();
			event.locals.inGuild = inGuildData.in_guild;

			if (!event.locals.inGuild) {
				return redirect(303, '/discord/logout');
			}
		}

		event.locals.token = token.token;
		event.locals.discordToken = token.discordToken;
		event.locals.discordId = token.discordUserId;
	}

	const response = await resolve(event);
	return response;
};
