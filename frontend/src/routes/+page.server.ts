import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import fileSchema from '$lib/schema/file';

import { env } from '$env/dynamic/private';

import type { Actions } from './$types';

export const load = async () => {
	return {
		form: await superValidate(zod4(fileSchema))
	};
};

export const actions = {
	default: async ({ request, fetch }) => {
		const form = await superValidate(request, zod4(fileSchema));

		if (!form.valid) {
			console.log(form.errors);
			return fail(400, { form });
		}

		const file = form.data.video;

		const formData = new FormData();
		formData.append('video', file, file.name);
		formData.append('target', String(form.data.target));

		const compressRequest = await fetch(`http://${env.BACKEND_HOST}:${env.BACKEND_PORT}/compress`, {
			method: 'POST',
			body: formData
		});

		if (!compressRequest.ok) {
			console.log(compressRequest.status, compressRequest.statusText);
			return fail(500, { form });
		}

		const output = await compressRequest.json();
		return message(form, output);
	}
} satisfies Actions;
