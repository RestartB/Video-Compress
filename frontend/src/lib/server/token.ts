import { db } from '$lib/server/db';
import { token } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

import type { RequestEvent } from '@sveltejs/kit';
import type { InferSelectModel } from 'drizzle-orm';

async function checkToken(
	event: RequestEvent
): Promise<InferSelectModel<typeof token> | undefined> {
	// token present check
	const tokenCookie = event.cookies.get('video_token');
	if (!tokenCookie) {
		console.log('no cookie')
		return;
	}

	// token valid check
	const tokenRecord = await db.select().from(token).where(eq(token.token, tokenCookie)).get();
	if (!tokenRecord) {
		console.log('no token record')
		return;
	}

	console.log('token found')
	return tokenRecord;
}

export { checkToken };
