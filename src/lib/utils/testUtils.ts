/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from "@testing-library/svelte"
import StoreTest from "./StoreTest.svelte";

export const renderWithState = (Component: any, props: any): void => {
    render(StoreTest, {...props, Component }, undefined);
}