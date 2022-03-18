import React, { ComponentProps } from "react";
import { shallow } from "enzyme";

import * as Nav from "../../../navFrontend";

import FeilmeldingDialog, { ModalBody } from "./feilmeldingDialog";

import MKV from "../../../melosyskodeverk";
import Valideringsfeil from "./Valideringsfeil";

describe("FeilmeldingDialog", () => {
  let props: ComponentProps<typeof FeilmeldingDialog> = {
    avbryt: jest.fn(),
    valideringer: [],
    feilmeldinger: [],
  };

  beforeEach(() => {
    props = {
      avbryt: jest.fn(),
      valideringer: [
        {
          kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER,
          felter: [],
        },
        {
          kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.TREDJELANDSBORGER_IKKE_AVTALELAND,
          felter: [],
        },
      ],
      feilmeldinger: [],
    };
  });

  it("Viser en modal", () => {
    const feilmeldingDialog = shallow(<FeilmeldingDialog {...props} />);

    expect(feilmeldingDialog.find(Nav.Modal)).toHaveLength(1);
  });

  it("Viser en liste over valideringsfeil", () => {
    const feilmeldingDialog = shallow(<FeilmeldingDialog {...props} />);
    const valideringsfeil = feilmeldingDialog.find(Valideringsfeil);

    expect(valideringsfeil).toHaveLength(2);
    expect(valideringsfeil.first().props().validering.kode).toBe(props.valideringer[0].kode);
    expect(valideringsfeil.last().props().validering.kode).toBe(props.valideringer[1].kode);
  });

  it("Viser en liste over feilmeldinger for feilmeldinger", () => {
    props.valideringer = [];
    props.feilmeldinger = [
      { tittel: "tittel1", innhold: "innhold1" },
      { tittel: "tittel2", innhold: "innhold2" },
    ];

    const feilmeldingDialog = shallow(<FeilmeldingDialog {...props} />);
    const feilmeldinger = feilmeldingDialog.find(ModalBody);

    expect(feilmeldinger).toHaveLength(2);
  });

  it("foretrekker å vise valideringer", () => {
    props.feilmeldinger = [
      { tittel: "tittel1", innhold: "innhold1" },
      { tittel: "tittel2", innhold: "innhold2" },
    ];

    const feilmeldingDialog = shallow(<FeilmeldingDialog {...props} />);
    const valideringsfeil = feilmeldingDialog.find(Valideringsfeil);
    const feilmeldinger = feilmeldingDialog.find(ModalBody);

    expect(valideringsfeil).toHaveLength(2);
    expect(feilmeldinger).toHaveLength(0);
  });
});
