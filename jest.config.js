/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
	globals: {
		'ts-jest': {
			isolatedModules: true
		}
	},
	transform: {
		'^.+\\.svelte$': [
			'svelte-jester',
			{
				preprocess: true
			}
		],
		'^.+\\.ts$': 'ts-jest'
	},
	moduleFileExtensions: ['js', 'ts', 'svelte'],
	maxWorkers: 1
};
