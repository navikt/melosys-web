import { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

import Legend from "./legend";

describe("Legend", () => {
  const mockedProps = mock<ComponentProps<typeof Legend>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
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

  it("symbolsynlighet-prop satt til false viser rediger og slett knapp", () => {
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

  it("rendrer UndertittelH3 med korrekt tekst", () => {
    props.tittel = "Test Title";
    renderWithProviders(<Legend {...props} />);

    const undertittelH3 = screen.queryByText("Test Title");
    expect(undertittelH3).toBeInTheDocument();
  });
});
