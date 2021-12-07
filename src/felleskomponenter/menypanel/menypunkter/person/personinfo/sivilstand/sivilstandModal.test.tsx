import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import * as Nav from "../../../../../../navFrontend";

import SivilstandModal, { SivilstandTabell } from "./sivilstandModal";

describe("SivilstandModal", () => {
  const mockedProps = mock<ComponentProps<typeof SivilstandModal>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.lukkModal = jest.fn();
    props.modalAriaHideApp = false;
    props.aktiveSivilstander = [
      {
        type: "Gift",
        relatertVedSivilstand: "123",
        bekreftelsesdato: "2009-10-09",
        gyldigFraOgMed: "2009-10-10",
        master: "PDL",
        kilde: "FREG",
        erHistorisk: false,
      },
    ];
    props.historiskeSivilstander = [
      {
        type: "Ugift",
        relatertVedSivilstand: "321",
        bekreftelsesdato: "2008-01-01",
        gyldigFraOgMed: "2008-01-02",
        master: "PDL",
        kilde: "FREG",
        erHistorisk: true,
      },
    ];
  });

  it("viser en Modal", () => {
    const sivilstandModal = shallow(<SivilstandModal {...props} />);

    const modal = sivilstandModal.find(Nav.Modal);
    expect(modal).toHaveLength(1);
    expect(modal.props().onRequestClose).toBe(props.lukkModal);
  });

  it("viser tabell for aktiv sivilstand og historiske sivilstander", () => {
    const sivilstandModal = shallow(<SivilstandModal {...props} />);

    const sivilstandTabeller = sivilstandModal.find(SivilstandTabell);
    expect(sivilstandTabeller).toHaveLength(2);
    expect(sivilstandTabeller.first().props().sivilstander).toEqual(props.aktiveSivilstander);
    expect(sivilstandTabeller.last().props().sivilstander).toEqual(props.historiskeSivilstander);
  });
});
