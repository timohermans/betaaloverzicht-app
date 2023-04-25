<script lang="ts">
	import { t } from './i18n';

	export let ibans: string[];
	export let value: string;

	let form: HTMLFormElement;
</script>

<form bind:this={form}>
	<select name="iban" bind:value on:change={() => form.submit()}>
	  {#each ibans as iban}
		<option selected={value === iban}>{iban}</option>
	  {:else}
		<option>{$t('accounts_no_accounts_yet')}</option>
	  {/each}
	</select>
	<noscript>
	  <button type="submit">Filter</button>
	</noscript>
  </form>
