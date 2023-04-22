export type Translation = {
	login_username_label: string;
	login_password_label: string;
	login_login_button: string;
	login_incorrect_message: string;
	logout_message: string;
	logout_confirm: string;
	month_statistics_title: string;
	month_statistics_subtitle: string;
	accounts_no_accounts_yet: string;
	summaries_title: string;
	totals_to_use_next_month: string;
	transaction_title: string;
	transaction_assign_similar_label: string;
	transaction_assign_select_existing_category: string;
	week: string;
	weekly_budget_title: string;
	weekly_budget_subtitle: string;
};
export type TranslationMap = Record<string, Translation>;

export const translationMap = {
	nl: {
		login_username_label: 'Gebruikersnaam',
		login_password_label: 'Wachtwoord',
		login_login_button: 'Log in',
		login_incorrect_message: 'Gebruikersnaam of wachtwoord niet correct',
		logout_confirm: 'Log uit',
		logout_message: 'Weet je zeker dat je wilt uitloggen?',
		month_statistics_title: 'Deze maand',
		month_statistics_subtitle: 'Hoe staan we ervoor?',
		accounts_no_accounts_yet: 'Er zijn nog geen accounts. Voeg transacties toe!',
		summaries_title: 'Per categorie',
		totals_to_use_next_month: 'Budget per week',
		transaction_title: 'Transacties',
		transaction_assign_similar_label: 'En misschien nog {{count}} andere(n):',
		transaction_assign_select_existing_category: 'of selecteer een bestaande:',
		week: 'Week',
		weekly_budget_title: 'Wekelijks budget',
		weekly_budget_subtitle: 'Berekend met gegevens van vorige maand'
	}
} as TranslationMap;
