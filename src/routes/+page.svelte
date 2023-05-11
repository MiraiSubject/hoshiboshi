<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';

	export let data: PageData;
	export let form: ActionData;

	const { form: sForm, enhance, errors } = superForm(data.sForm, {
		invalidateAll: false
	});
</script>

<form method="POST" use:enhance>
	<label for="jadehistoryurl">
		URL to get jade history:
		<input
			type="text"
			name="url"
			data-invalid={$errors.url}
			bind:value={$sForm.url}
			placeholder="https://api-os-takumi.hoyoverse.com/common/hkrpg_self_help_inquiry/Stellar/GetList"
			required
		/>
	</label>

	{#if $errors.url}<span class="invalid">{$errors.url}</span>{/if}

	<button>Submit</button>
</form>

{#if form}
	{#if form.jadeActionList && form.totalJades && form.uniqueActions}
		<p>Your total jades: {form.totalJades}</p>

		<table>
			<tr>
				<td>Action</td>
				<td>Times</td>
				<td>Total Jades</td>
				<td>Last earned</td>
			</tr>
			{#each Array.from(form.uniqueActions.values()).sort((a, b) => b.lastUpdated > a.lastUpdated ? 1 : -1) as action}
				<tr>
					<td>
						{action.action} ({action.jades} jades worth)
					</td>
					<td>
						{action.times}x
					</td>
					<td>
						{action.totalJades}
					</td>
					<td>
						{action.lastUpdated.toLocaleString()}
					</td>
				</tr>
			{/each}
		</table>
	{/if}
{/if}
