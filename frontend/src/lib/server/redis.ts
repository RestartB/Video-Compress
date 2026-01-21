import { createClient } from 'redis';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

let client: ReturnType<typeof createClient>;

if (!building) {
	client = await createClient({
		socket: { host: env.REDIS_HOST, port: parseInt(env.REDIS_PORT) }
	})
		.on('error', (err) => console.log('Redis Client Error', err))
		.connect();
}

export { client };
