import { checkToken } from '$lib/server/token';

import type { LayoutServerLoad } from './$types';
import type { UserInfo } from '$lib/interfaces/userInfo';

export const load: LayoutServerLoad = async (event) => {
	let userData: UserInfo | null = null;

	if (!(await checkToken(event))) {
		return { userData, inGuild: false };
	}

	const userRequest = await event.fetch('/discord/identify');

	if (userRequest.status === 401) {
		return { userData, inGuild: false };
	}

	if (!userRequest.ok) {
		console.error('Failed to fetch user data:', await userRequest.text());
		return { userData };
	}
	userData = await userRequest.json();

	return { userData, inGuild: event.locals.inGuild };
};
