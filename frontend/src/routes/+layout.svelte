<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();
	let shortUserData = $derived(data.userData?.userData);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen min-w-screen items-center justify-center">
	<div
		class="flex h-full max-h-150 w-full max-w-150 flex-col gap-4 rounded-xl border-2 border-zinc-300 bg-zinc-200 p-4 dark:border-zinc-700 dark:bg-zinc-800"
	>
		<div class="flex items-center justify-between gap-2">
			<div>
				<h1 class="text-2xl font-bold">Video Compressor</h1>
				<p>Compress a video up to 500MB.</p>
			</div>

			{#if data.userData}
				<img
					src={shortUserData?.avatar
						? `https://cdn.discordapp.com/avatars/${shortUserData.id}/${shortUserData.avatar}.png`
						: undefined}
					alt="{shortUserData?.global_name}'s PFP"
					class="h-10 w-10 rounded-full border-2 border-zinc-300 dark:border-zinc-700"
				/>
			{/if}
		</div>

		<hr class="border-zinc-500" />

		{@render children()}
	</div>
</div>
