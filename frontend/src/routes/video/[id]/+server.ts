import { error } from '@sveltejs/kit';
import { client } from '$lib/server/redis';

export async function GET({ params, locals }) {
	if (!locals.token || !locals.inGuild) {
		return error(403, 'Forbidden');
	}

	const videoBuffer = await client.get(params.id);

	if (!videoBuffer) {
		console.log('not found');
		return error(404, 'Video not found');
	}

	await client.del(params.id);

	const decoded = atob(videoBuffer);
	const bytes = new Uint8Array(decoded.length);
	for (let i = 0; i < decoded.length; i++) {
		bytes[i] = decoded.charCodeAt(i);
	}

	return new Response(bytes, {
		headers: {
			'Content-Type': 'video/mp4',
			'Content-Length': bytes.length.toString()
		}
	});
}
