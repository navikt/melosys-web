import { ComponentProps } from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

import Legend from "./legend";

describe("Legend", () => {
  let props: ComponentProps<typeof Legend>;

  beforeEach(() => {
    props = {} as ComponentProps<typeof Legend>;
  });

  it("Viser ingen symboler hvis ikke redigerbart", () => {
    props.redigerbart = false;
    renderWithProviders(<Legend {...props} />);

    expect(screen.queryByRole("button", { name: "rediger" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "slett" })).not.toBeInTheDocument();
  });

  it("symbolsynlighet-prop satt til true viser rediger og slett knapp", () => {
    props.symbolsynlighet = { pencil: true, bin: true };
    props.redigerbart = true;
    renderWithProviders(<Legend {...props} />);

    expect(screen.getByRole("button", { name: "Rediger" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Slett" })).toBeInTheDocument();
  });

  it("symbolsynlighet-prop satt til false viser ikke rediger og slett knapp", () => {
    props.symbolsynlighet = { pencil: false, bin: false };
    renderWithProviders(<Legend {...props} />);

    expect(screen.queryByRole("button", { name: "Rediger" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Slett" })).not.toBeInTheDocument();
  });

  it("rendrer TittelIkon når oppgitt", () => {
    props.tittelIkon = () => <div>tittel-ikon</div>;
    renderWithProviders(<Legend {...props} />);

    expect(screen.queryByText("tittel-ikon")).toBeInTheDocument();
  });

  it("rendrer tittel med korrekt tekst", () => {
    props.tittel = "Test Title";
    renderWithProviders(<Legend {...props} />);

    const tittel = screen.queryByText("Test Title");
    expect(tittel).toBeInTheDocument();
  });
});
