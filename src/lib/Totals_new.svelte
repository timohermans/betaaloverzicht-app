<script lang="ts">
	import type { Transaction } from '$lib/types';
	import { to_number } from './transaction';

	export let transactions: Transaction[];

	function computeTransactionSummary(transactions: Transaction[]) {
		return transactions.reduce(
			(acc, transaction) => {
				const amount = to_number(transaction.amount);

				if (amount > 0) {
					acc.totalIncomeAmount += amount;
				} else {
					acc.totalExpenseAmount += amount;
				}

				if (transaction.authorization_code) {
					acc.totalAmountWithAuthorizationCode += amount;
				}

				return acc;
			},
			{ totalIncomeAmount: 0, totalExpenseAmount: 0, totalAmountWithAuthorizationCode: 0 }
		);
	}
</script>

<h1>Total Amount Income: {getTotalAmountIncome()}</h1>
<h1>Total Amount Expenses: {getTotalAmountExpenses()}</h1>
<h1>Total Amount based on authorization_code: {getTotalAmount('authorization_code')}</h1>
