import { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { render, screen } from "@testing-library/react";

import { Bostedsadresse, Kontaktadresse, Oppholdsadresse } from "../../../../../graphql";
import { Adresser } from "./adresser";

describe("Adresser", () => {
  const mockedProps = mock<ComponentProps<typeof Adresser>>();
  let props = instance(mockedProps);

  const mockedBostedsadresse = mock<Bostedsadresse>();
  const bostedsadresser = [instance(mockedBostedsadresse)];

  const mockedOppholdsadresse = mock<Oppholdsadresse>();
  const oppholdsadresser = [instance(mockedOppholdsadresse)];

  const mockedKontaktadresse = mock<Kontaktadresse>();
  const kontaktadresser = [instance(mockedKontaktadresse)];

  beforeEach(() => {
    props = instance(mockedProps);
    props.data = {
      hentSaksopplysninger: {
        persondata: {
          ...(props.data.hentSaksopplysninger?.persondata || []),
          bostedsadresser,
          oppholdsadresser,
          kontaktadresser,
        },
      },
    };
  });

  it("viser tabell for hver adressetype hvis de finnes", () => {
    render(<Adresser {...props} />);

    expect(screen.getAllByRole("table")).toHaveLength(3);
    expect(screen.getByText("Bostedsadresse")).toBeDefined();
    expect(screen.getByText("Oppholdsadresse")).toBeDefined();
    expect(screen.getByText("Kontaktadresse")).toBeDefined();
  });

  it("viser ikke tabell for adresser hvis ingen finnes", () => {
    props.data.hentSaksopplysninger.persondata.bostedsadresser = [];
    props.data.hentSaksopplysninger.persondata.oppholdsadresser = [];
    props.data.hentSaksopplysninger.persondata.kontaktadresser = [];

    render(<Adresser {...props} />);

    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText("Bostedsadresse")).toBeNull();
    expect(screen.queryByText("Oppholdsadresse")).toBeNull();
    expect(screen.queryByText("Kontaktadresse")).toBeNull();
  });
});
