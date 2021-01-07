import React, { ComponentProps } from "react";
import { shallow } from "enzyme";

import * as Nav from "../../../utils/navFrontend";
import * as KV from "../../../kodeverk";

import DialogboksValidering, { Validering, ModalBody, Valideringsfeil } from "./dialogboksValidering";

import MKV from "../../../melosyskodeverk";

describe("DialogboksValidering", () => {
  let props: ComponentProps<typeof DialogboksValidering> = {
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
    const dialogboksValidering = shallow(<DialogboksValidering {...props} />);

    expect(dialogboksValidering.find(Nav.Modal)).toHaveLength(1);
  });

  it("Viser en liste over valideringsfeil", () => {
    const dialogboksValidering = shallow(<DialogboksValidering {...props} />);
    const valideringsfeil = dialogboksValidering.find(Valideringsfeil);

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

    const dialogboksValidering = shallow(<DialogboksValidering {...props} />);
    const feilmeldinger = dialogboksValidering.find(ModalBody);

    expect(feilmeldinger).toHaveLength(2);
  });

  it("foretrekker å vise valideringer", () => {
    props.feilmeldinger = [
      { tittel: "tittel1", innhold: "innhold1" },
      { tittel: "tittel2", innhold: "innhold2" },
    ];

    const dialogboksValidering = shallow(<DialogboksValidering {...props} />);
    const valideringsfeil = dialogboksValidering.find(Valideringsfeil);
    const feilmeldinger = dialogboksValidering.find(ModalBody);

    expect(valideringsfeil).toHaveLength(2);
    expect(feilmeldinger).toHaveLength(0);
  });
});

describe("Validering", () => {
  it('Viser feilmelding "Ukjent feil" dersom det ikke finnes en mapping for feilkode', () => {
    const validering = shallow(<Validering valideringKode="tilfeldingString" />);
    const modalBody = validering.find(ModalBody);

    expect(modalBody).toHaveLength(1);
    expect(modalBody.props().tittel).toBe("Ukjent feil");
  });

  it("viser feilmelding fra kodeverk dersom ingen mapping for feilmelding finnes, og kontrollkode stammer fra manglende utfylling av felter", () => {
    const validering = shallow(
      <Validering valideringKode={MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE} />
    );

    const modalBody = validering.find(ModalBody);
    expect(modalBody).toHaveLength(1);

    expect(modalBody.props().tittel).toBe("Manglende utfylling");
    expect(modalBody.props().innhold).toBe(
      KV.kodeTilTerm(
        MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE,
        MKV.KTObjects.begrunnelser.kontroll_begrunnelser
      )
    );
  });

  it(`viser feilmelding fra kodeverk dersom ingen mapping for feilmelding finnes, og kontrollkode er ${MKV.Koder.begrunnelser.kontroll_begrunnelser.INGEN_SLUTTDATO}`, () => {
    const validering = shallow(
      <Validering valideringKode={MKV.Koder.begrunnelser.kontroll_begrunnelser.INGEN_SLUTTDATO} />
    );

    const modalBody = validering.find(ModalBody);
    expect(modalBody).toHaveLength(1);

    expect(modalBody.props().tittel).toBe("Feil ved kontroll");
    expect(modalBody.props().innhold).toBe(
      KV.kodeTilTerm(
        MKV.Koder.begrunnelser.kontroll_begrunnelser.INGEN_SLUTTDATO,
        MKV.KTObjects.begrunnelser.kontroll_begrunnelser
      )
    );
  });
});
