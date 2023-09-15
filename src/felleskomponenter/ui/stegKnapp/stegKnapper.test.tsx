import { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import StegKnapper from "./stegKnapper";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import { expect } from "vitest";
import { screen, within } from "@testing-library/react";

describe("stegKnapper", () => {
  const mockedProps = mock<ComponentProps<typeof StegKnapper>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.bekreftKnappProps = {};
  });

  it("viser ikke tilbake-knapp når tilbakeknappProps er undefined", () => {
    props.tilbakeKnappProps = undefined;

    renderWithProviders(<StegKnapper {...props} />);

    const knapper = screen.queryAllByRole("button");
    expect(knapper).toHaveLength(1);
    expect(within(knapper[0]).getByText("Bekreft og fortsett")).toBeInTheDocument();
  });

  it("viser tilbake-knapp når tilbakeknappProps er definert", () => {
    props.tilbakeKnappProps = { onClick: vi.fn() };
    renderWithProviders(<StegKnapper {...props} />);

    const knapper = screen.queryAllByRole("button");
    expect(knapper).toHaveLength(2);
    expect(within(knapper[0]).getByText("Bekreft og fortsett")).toBeInTheDocument();
    expect(within(knapper[1]).getByText("Tilbake")).toBeInTheDocument();
  });
});
