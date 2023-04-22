<script lang="ts">
	export let type: 'normal' | 'success' | 'danger' = 'normal';
</script>

<span class="amount {type}">
	<slot />
</span>

<style>
	.amount {
		border-radius: 0.5rem;
		color: white;
		padding: 7px 10px;
		text-align: center;
		font-weight: bold;
	}

	.amount.normal {
		background-color: #73828c;
	}

	.amount.danger {
		background-color: #ff2100;
	}

	.amount.success {
		background-color: #3cba7d;
	}
</style>
