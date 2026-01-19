import { error, json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { db } from '$lib/server/db';
import { token } from '$lib/server/db/schema';

import crypto from 'crypto';

import {
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	DISCORD_REDIRECT_URI,
	MODE
} from '$env/static/private';

export const POST: RequestHandler = async ({ locals, request, cookies }) => {
	if (locals.token) {
		throw redirect(303, '/');
	}

	const body = await request.json();

	if (!body || !body.code) {
		throw error(400, 'Authentication failed');
	}

	if (!body.state) {
		throw error(400, 'Authentication failed');
	}

	if (body.state !== cookies.get('video_state')) {
		throw error(400, 'Authentication failed');
	}

	cookies.delete('video_state', { path: '/' });

	const newRequest = await fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: DISCORD_CLIENT_ID ?? '',
			client_secret: DISCORD_CLIENT_SECRET ?? '',
			grant_type: 'authorization_code',
			code: body.code ?? '',
			redirect_uri: DISCORD_REDIRECT_URI ?? ''
		})
	});

	if (!newRequest.ok) {
		console.log(newRequest.status, newRequest.statusText);
		console.log(await newRequest.json());
		throw error(500, 'Authentication failed');
	}

	const data = await newRequest.json();
	const tokenData = crypto.randomBytes(16).toString('base64');

	const userRequest = await fetch('https://discord.com/api/users/@me', {
		headers: {
			Authorization: `Bearer ${data.access_token}`
		}
	});

	if (!userRequest.ok) {
		throw error(500, 'Failed to fetch user data from Discord');
	}

	const userData = await userRequest.json();
	const discordUserId = userData.id;

	// FIXME: implement encryption - this is just a test implementation for now
	await db.insert(token).values({
		token: tokenData,
		hash: '',
		createdAt: new Date(),
		tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
		discordToken: data.access_token,
		discordExpiresIn: data.expires_in,
		discordUserId: discordUserId
	});

	cookies.set('video_token', tokenData, {
		httpOnly: true,
		secure: MODE.toLowerCase() === 'production',
		sameSite: 'strict',
		path: '/',
		maxAge: 60 * 60 * 24 * 7
	});

	return json({ success: true });
};
