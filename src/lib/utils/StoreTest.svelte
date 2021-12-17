<script lang="ts">
    import type {Category, Transaction} from '../transaction';
    import {transactions as storeTransactions, categories as storeCategories} from "../store";

    export let Component;
    export let transactions: Transaction[] = [];
    export let categories: Category[] = [];

    $: if (transactions.length > 0) {
        storeTransactions.set(transactions);
    }

    $: if (categories.length > 0) {
        storeCategories.set(categories);
    }
</script>

<svelte:component this={Component}>
</svelte:component>
