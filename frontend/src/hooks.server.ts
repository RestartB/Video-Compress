import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	console.log(`Handling request for ${event.url.pathname}`);

	event.setHeaders({
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'SAMEORIGIN',
		'Strict-Transport-Security': 'max-age=604800; includeSubDomains'
	});

	const response = await resolve(event);
	return response;
};
