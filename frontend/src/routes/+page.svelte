<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { superForm, fileProxy } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import fileSchema from '$lib/schema/file';

	import { Video, CircleAlert, Upload, Download, LoaderCircle, X } from '@lucide/svelte';

	import type { SubmitFunction } from '@sveltejs/kit';

	let { data } = $props();
	let progress = $state(0);

	let error = $state(false);
	let errorCode: number | undefined = $state(0);

	function fileUploadWithProgress(input: Parameters<SubmitFunction>[0]) {
		return new Promise<XMLHttpRequest>((resolve) => {
			const xhr = new XMLHttpRequest();

			xhr.upload.onprogress = function (event) {
				progress = Math.round((100 * event.loaded) / event.total);
			};

			xhr.onload = function () {
				if (xhr.readyState === xhr.DONE) {
					progress = 0;
					resolve(xhr);
				}
			};

			xhr.open('POST', input.action, true);
			xhr.send(input.formData);
		});
	}

	const { form, errors, allErrors, submitting, message, enhance } = $derived(
		superForm(data.form, {
			validators: zod4Client(fileSchema),

			onSubmit({ customRequest }) {
				customRequest(fileUploadWithProgress);
			},

			onError({ result }) {
				console.log('error');

				error = true;
				errorCode = result.status;
			}
		})
	);

	const file = $derived(fileProxy(form, 'video'));
	$form.target = 10;

	$inspect(error);
</script>

{#if error}
	<div
		class="fixed inset-0 isolate z-100 flex flex-col items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
		transition:fade={{ duration: 100 }}
	>
		<div class="absolute inset-0 -z-10" onclick={() => (error = false)} aria-hidden="true"></div>

		<div
			class="flex max-h-screen flex-col gap-4 rounded-xl border-2 border-zinc-300 bg-zinc-200 p-4 dark:border-zinc-700 dark:bg-zinc-800"
			style="width: min(400px, 100%); height: min(200px, 100vh);"
			transition:scale={{ duration: 300, easing: cubicOut, start: 0.9, opacity: 1 }}
		>
			<div class="flex w-full shrink-0 items-center justify-between gap-2">
				<h2 class="text-xl font-bold">Error {errorCode}</h2>
				<button
					class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-300 text-zinc-700 hover:bg-zinc-400 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
					onclick={() => (error = false)}
					aria-label="Close error popup"
				>
					<X size={24} />
				</button>
			</div>

			<div
				class="flex w-full flex-1 flex-col overflow-auto rounded-xl border-2 border-zinc-300 bg-zinc-100 p-4 dark:border-zinc-700 dark:bg-zinc-700"
			>
				<p>An error occurred while compressing your video. Please try again later.</p>
			</div>
		</div>
	</div>
{/if}

<form method="POST" enctype="multipart/form-data" class="flex flex-col gap-2" use:enhance>
	<div>
		<h2 class="font-bold">Video</h2>
		<p>The video to compress.</p>
	</div>

	<label
		class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-zinc-400 bg-zinc-100 p-2 px-4 transition-colors hover:bg-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:hover:bg-zinc-800"
		for="file"><Video size={20} class="shrink-0" />Select video...</label
	>
	<input
		type="file"
		id="file"
		name="video"
		accept="video/*"
		bind:files={$file}
		class="absolute hidden"
	/>

	{#if $form.video}
		<p><b>{$form.video.name}</b> ({($form.video.size / 1_048_576).toFixed(1)}MiB)</p>
	{/if}

	{#if $errors.video}
		{#each $errors.video as error}
			<span class="flex items-center gap-2">
				<CircleAlert class="shrink-0" />
				<p>{error}</p>
			</span>
		{/each}
	{/if}

	{#if $form.video}
		<hr class="border-zinc-500" />

		<div>
			<h2 class="font-bold">Target Size</h2>
			<p>The file size in MiB to target. Max 50MiB, the Discord limit is 10MiB.</p>
		</div>

		<input
			class="w-full rounded-xl border-2 border-zinc-400 bg-zinc-100 p-2 px-4 transition-colors focus:bg-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:focus:bg-zinc-800"
			name="target"
			type="number"
			bind:value={$form.target}
		/>

		{#if $errors.target}
			{#each $errors.target as error}
				<span class="flex items-center gap-2">
					<CircleAlert class="shrink-0" />
					<p>{error}</p>
				</span>
			{/each}
		{/if}

		<button
			class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-zinc-400 bg-zinc-100 p-2 px-4 transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 dark:hover:bg-zinc-800 disabled:dark:hover:bg-zinc-700"
			type="submit"
			disabled={$allErrors.length > 0 || !$form.target || $submitting}
		>
			{#if progress === 100}
				<LoaderCircle class="shrink-0 animate-spin" /> Compressing... this may take a minute.
			{:else if $submitting}
				<LoaderCircle class="shrink-0 animate-spin" /> Uploading...
			{:else}
				<Upload class="shrink-0" /> Upload and compress
			{/if}
		</button>

		{#if $submitting && progress < 100}
			<div class="h-5 w-full overflow-hidden rounded-full border-2 border-zinc-400">
				<div class="h-full bg-zinc-400" style="width: {progress}%"></div>
			</div>
		{/if}
	{/if}
</form>

{#if $message}
	<div>
		<h2 class="text-xl font-bold">Compressed!</h2>
		<p>New size: {($message['size'] / 1_048_576).toFixed(1)}MiB</p>
	</div>

	<span class="flex items-center gap-2">
		<CircleAlert class="shrink-0" />
		<p>
			The compressed video will be available to download for a max of 15 minutes, after this or if
			the video is downloaded it will be deleted
		</p>
	</span>

	<a
		class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-zinc-400 bg-blue-100 p-2 px-4 transition-colors hover:bg-blue-300 dark:border-zinc-600 dark:bg-blue-950 dark:hover:bg-blue-900"
		href="/video/{$message['file_id']}"
		download
	>
		<Download class="shrink-0" /> Download
	</a>
{/if}
