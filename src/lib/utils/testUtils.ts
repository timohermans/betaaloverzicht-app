/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from '@testing-library/svelte';
import StoreTest from './StoreTest.svelte';

export const renderWithState = (Component: any, state: any): void => {
	render(StoreTest, { ...state, Component }, undefined);
};

export const renderWithPropsAndState = (Component: any, props: any, state: any): void => {
	renderWithState(Component, { ...state, componentProps: props });
};
