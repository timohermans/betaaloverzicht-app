// import { Collections, type UsersRecord } from './book_types';

// export function is_authenticated(): boolean {
// 	return pb.authStore.isValid;
// }

// export function get_authenticated_user(): UsersRecord | null {
// 	if (!pb.authStore.isValid) {
// 		return null;
// 	}

// 	return pb.authStore.model as UsersRecord;
// }

// export async function login_with(username: string, password: string) {
// 	await pb.collection(Collections.Users).authWithPassword(username, password);
// }

// TODO: serverside this
// export function logout(): void | Promise<void> {
// 	return pb.authStore.clear();
// }
