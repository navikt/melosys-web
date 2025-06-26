import React, { PropsWithChildren, ReactElement } from "react";
import { render, RenderOptions, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { createTestStore } from "./createTestStore";

interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: object | undefined;
  store?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState = {}, store = createTestStore(preloadedState), ...renderOptions }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren<object>): React.JSX.Element {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Async version of renderWithProviders that wraps in act()
 * Use this for components that perform async operations during render
 */
export const renderWithProvidersAsync = async (ui: ReactElement, options: ExtendedRenderOptions = {}) => {
  return act(async () => {
    return renderWithProviders(ui, options);
  });
};
