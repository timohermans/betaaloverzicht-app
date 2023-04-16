export type Translation = {
	login_username_label: string;
	login_password_label: string;
	login_login_button: string;
	login_incorrect_message: string;
	logout_message: string;
	logout_confirm: string;
	accounts_no_accounts_yet: string;
	summaries_title: string;
	totals_to_use_next_month: string;
	transaction_title: string;
	transaction_assign_similar_label: string;
	transaction_assign_select_existing_category: string;
	week: string;
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
		accounts_no_accounts_yet: 'Er zijn nog geen accounts. Voeg transacties toe!',
		summaries_title: 'Per categorie',
		totals_to_use_next_month: 'Wekelijks budget',
		transaction_title: 'Transacties',
		transaction_assign_similar_label: 'En misschien nog {{count}} andere(n):',
		transaction_assign_select_existing_category: 'of selecteer een bestaande:',
		week: 'Week'
	}
} as TranslationMap;
