import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";

import { Familiemedlemmer, FamiliemedlemmerGruppe } from "./familiemedlemmer";

const { EKTE, REPA } = KV.Koder.Relasjonsrolle;

describe("Familiemedlemmer", () => {
  const mockedProps = mock<ComponentProps<typeof Familiemedlemmer>>();
  let props = instance(mockedProps);

  const mockedFamiliemedlem = mock<Api.Familiemedlem>();
  const familiemedlem = instance(mockedFamiliemedlem);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it(`viser 'Ektefelle' for relasjonstypeKode ${EKTE}`, () => {
    props.familiemedlemmer = [
      {
        ...familiemedlem,
        relasjonstype: {
          kode: EKTE,
          term: "Ektefelle til",
        },
      },
    ];

    const familiemedlemmer = shallow(<Familiemedlemmer {...props} />);

    const ektefellerOgPartnere = familiemedlemmer.find(FamiliemedlemmerGruppe).last();
    expect(ektefellerOgPartnere.props().familiemedlemmer[0].relasjonstype.term).toBe("Ektefelle");
  });

  it(`viser 'Partner' for relasjostypeKode ${REPA}`, () => {
    props.familiemedlemmer = [
      {
        ...familiemedlem,
        relasjonstype: {
          kode: REPA,
          term: "Registrert partner med",
        },
      },
    ];

    const familiemedlemmer = shallow(<Familiemedlemmer {...props} />);

    const ektefellerOgPartnere = familiemedlemmer.find(FamiliemedlemmerGruppe).last();
    expect(ektefellerOgPartnere.props().familiemedlemmer[0].relasjonstype.term).toBe("Partner");
  });
});
