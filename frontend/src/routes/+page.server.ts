import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import fileSchema from '$lib/schema/file';

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
			return fail(400, { form });
		}

		const file = form.data.video;

		const formData = new FormData();
		formData.append('video', file, file.name);
		formData.append('target', String(form.data.target));

		const compressRequest = await fetch('http://127.0.0.1:5000/compress', {
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
