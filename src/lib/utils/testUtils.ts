/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, type RenderResult } from '@testing-library/svelte';
import type { Budget, Category, Transaction } from '$lib/types';
import StoreTest from './StoreTest.svelte';
import type { ComponentProps, SvelteComponent } from 'svelte';
import { vi } from 'vitest';

type StoreTestProps = {
	date?: Date;
	budgets?: Budget[];
	categories?: Category[];
	transactions?: Transaction[];
	componentProps?: any;
	showStateData?: boolean;
};

export const pb_mock = {
	pb: {
		authStore: {
			model: {},
			onChange: vi.fn()
		}
	}
};

export const renderWithState = <C extends SvelteComponent>(
	Component: ConstructorOfATypedSvelteComponent,
	state: StoreTestProps = {},
	showStateData = false
): RenderResult<StoreTest> => {
	return render(StoreTest, { ...state, Component, showStateData }, undefined);
};

export const renderWithPropsAndState = <C extends SvelteComponent>(
	Component: ConstructorOfATypedSvelteComponent,
	props: ComponentProps<C>,
	state: StoreTestProps,
	showStateData = false
): void => {
	renderWithState(Component, { ...state, componentProps: props }, showStateData);
};
