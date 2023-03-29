/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { render } from '@testing-library/svelte';
import type { Budget, Category, Transaction } from '$lib/types';
import StoreTest from './StoreTest.svelte';

type StoreTestProps = {
	date?: Date;
	budgets?: Budget[];
	categories?: Category[];
	transactions?: Transaction[];
	componentProps?: any;
	showStateData?: boolean;
};

export const renderWithState = (
	Component: any,
	state: StoreTestProps,
	showStateData = false
): void => {
	render(StoreTest, { ...state, Component, showStateData }, undefined);
};

export const renderWithPropsAndState = (
	Component: any,
	props: any,
	state: StoreTestProps,
	showStateData = false
): void => {
	renderWithState(Component, { ...state, componentProps: props }, showStateData);
};
