import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import { Bostedsadresse } from "../../../../../../graphql";

import AdresseTableContainer from "./adresseTableContainer";
import AdresseTable from "./adresseTable";

describe("AdresseTableContainer", () => {
  const mockedProps = mock<ComponentProps<typeof AdresseTableContainer>>();
  const props = instance(mockedProps);

  const mockedBostedsadresse = mock<Bostedsadresse>();
  const bostedsadresse = instance(mockedBostedsadresse);

  beforeEach(() => {
    props.adresser = [
      { ...bostedsadresse, erHistorisk: false },
      { ...bostedsadresse, erHistorisk: true },
    ];
    props.adressetype = "Bostedsadresse";
  });

  it("viser aktive adresser", () => {
    const adresseTableContainer = shallow(<AdresseTableContainer {...props} />);
    const aktivAdresseTable = adresseTableContainer.find(AdresseTable).first();
    expect(aktivAdresseTable.props().adresser.map((e) => e.erHistorisk)).not.toContain(true);
    expect(aktivAdresseTable.props().adresser.map((e) => e.erHistorisk)).toContain(false);
  });

  it("viser historiske adresser", () => {
    const adresseTableContainer = shallow(<AdresseTableContainer {...props} />);
    const historiskAdresseTable = adresseTableContainer.find(AdresseTable).last();
    expect(historiskAdresseTable.props().adresser.map((e) => e.erHistorisk)).toContain(true);
    expect(historiskAdresseTable.props().adresser.map((e) => e.erHistorisk)).not.toContain(false);
  });
});
