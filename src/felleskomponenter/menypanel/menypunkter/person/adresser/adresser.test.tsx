import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import { Bostedsadresse, Oppholdsadresse, Kontaktadresse } from "../../../../../graphql";
import { Adresser } from "./adresser";
import AdresseTableContainer from "./adresseTable";

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

  it("viser bostedsadresser hvis de finnes", () => {
    const adresser = shallow(<Adresser {...props} />);

    const bostedsadresseKomponenter = adresser.findWhere(
      (n) => n.type() === AdresseTableContainer && n.props().adresser === bostedsadresser
    );
    expect(bostedsadresseKomponenter).toHaveLength(1);
  });

  it("viser ikke bostedsadresser hvis ingen finnes", () => {
    props.data.hentSaksopplysninger.persondata.bostedsadresser = [];

    const adresser = shallow(<Adresser {...props} />);

    const bostedsadresseKomponenter = adresser.findWhere(
      (n) => n.type() === AdresseTableContainer && n.props().adresser === bostedsadresser
    );
    expect(bostedsadresseKomponenter).toHaveLength(0);
  });

  it("viser oppholdsadresser hvis de finnes", () => {
    const adresser = shallow(<Adresser {...props} />);

    const oppholdsadresseKomponenter = adresser.findWhere(
      (n) => n.type() === AdresseTableContainer && n.props().adresser === oppholdsadresser
    );
    expect(oppholdsadresseKomponenter).toHaveLength(1);
  });

  it("viser ikke oppholdsadresser hvis ingen finnes", () => {
    props.data.hentSaksopplysninger.persondata.oppholdsadresser = [];

    const adresser = shallow(<Adresser {...props} />);

    const oppholdsadresseKomponenter = adresser.findWhere(
      (n) => n.type() === AdresseTableContainer && n.props().adresser === oppholdsadresser
    );
    expect(oppholdsadresseKomponenter).toHaveLength(0);
  });

  it("viser kontaktadresser hvis de finnes", () => {
    const adresser = shallow(<Adresser {...props} />);

    const kontaktadresseKomponenter = adresser.findWhere(
      (n) => n.type() === AdresseTableContainer && n.props().adresser === kontaktadresser
    );
    expect(kontaktadresseKomponenter).toHaveLength(1);
  });

  it("viser ikke kontaktadresser hvis ingen finnes", () => {
    props.data.hentSaksopplysninger.persondata.kontaktadresser = [];

    const adresser = shallow(<Adresser {...props} />);

    const kontaktadresseKomponenter = adresser.findWhere(
      (n) => n.type() === AdresseTableContainer && n.props().adresser === kontaktadresser
    );
    expect(kontaktadresseKomponenter).toHaveLength(0);
  });
});
