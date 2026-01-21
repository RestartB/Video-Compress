import { error } from '@sveltejs/kit';

import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import fileSchema from '$lib/schema/file';

import { env } from '$env/dynamic/private';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(fileSchema))
	};
};

export const actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod4(fileSchema));

		if (!form.valid) {
			console.log(form.errors);
			return fail(400, { form });
		}

		const file = form.data.video;

		const backendFormData = new FormData();
		backendFormData.append('video', file, file.name);
		backendFormData.append('target', String(form.data.target));

		const compressRequest = await fetch(`http://${env.BACKEND_HOST}:${env.BACKEND_PORT}/compress`, {
			method: 'POST',
			body: backendFormData
		});

		if (!compressRequest.ok) {
			console.log(compressRequest.status, compressRequest.statusText);
			return error(500);
		}

		const output = await compressRequest.json();
		return message(form, output);
	}
} satisfies Actions;
