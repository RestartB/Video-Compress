<script lang="ts">
	import { resolve } from '$app/paths';
	import discord from '$lib/assets/discord.svg';

	const { class: className = '' } = $props();
</script>

<a
	class="bg-blurple flex w-fit items-center justify-center gap-2 rounded-md p-2 px-4 text-white transition-all hover:brightness-150 {className}"
	href={resolve('/discord/login')}
>
	<img src={discord} alt="Discord" class="h-6 w-6" />
	Log in with Discord</a
>
