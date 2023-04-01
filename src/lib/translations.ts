export type Translation = {
	login_username_label: string;
	login_password_label: string;
	login_login_button: string;
	login_incorrect_message: string;
	accounts_no_accounts_yet: string;
};
export type TranslationMap = Record<string, Translation>;

export const translationMap = {
	nl: {
		login_username_label: 'Gebruikersnaam',
		login_password_label: 'Wachtwoord',
		login_login_button: 'Log in',
		login_incorrect_message: 'Gebruikersnaam of wachtwoord niet correct',
		accounts_no_accounts_yet: 'Er zijn nog geen accounts. Voeg transacties toe!'
	}
} as TranslationMap;
