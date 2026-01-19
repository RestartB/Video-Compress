<script lang="ts">
	import { onMount } from 'svelte';

	import { LoaderCircle, X } from '@lucide/svelte';
	import LogIn from '$lib/components/LogIn.svelte';

	let failed: string | undefined = $state();

	const getCookie = (name: string): string | null => {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) {
			return decodeURIComponent(parts.pop()?.split(';').shift() || '');
		}
		return null;
	};

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get('code');

		if (!code) {
			failed = 'Missing Code';
			return;
		}

		const state = params.get('state');
		const stateCookie = getCookie('video_state');

		if (!state || !stateCookie || state !== stateCookie) {
			failed = 'Invalid State';
			return;
		}

		// get redirect from state
		const stateParts = state.split('-');
		const redirectPart = stateParts.slice(2).join('-');
		const redirectTo = redirectPart ? decodeURIComponent(atob(redirectPart)) : '/';

		if (!redirectTo.startsWith('/')) {
			window.location.href = '/';
		}

		fetch('/discord/trade', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ code, state })
		})
			.then((res) => {
				if (res.ok) {
					window.location.href = `${window.location.origin}${redirectTo}`;
				} else {
					failed = 'Trade Failed';
				}
			})
			.catch(() => {
				failed = 'Trade Failed';
			});
	});
</script>

<div class="flex items-center gap-2">
	{#if failed}
		<div>
			<p>Log in failed, please try again. ({failed})</p>
			<LogIn class="mt-2" />
		</div>
	{:else}
		<LoaderCircle class="animate-spin" />
		<p class="font-semibold">Logging in...</p>
	{/if}
</div>
