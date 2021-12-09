import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import * as Nav from "../../../../../../navFrontend";

import PersonstatusModal, { PersonstatusTabell } from "./personstatusModal";

describe("PersonstatusModal", () => {
  const mockedProps = mock<ComponentProps<typeof PersonstatusModal>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.lukkModal = jest.fn();
    props.aktivePersonstatuser = [
      {
        kode: "BOSATT",
        tekst: "Bosatt etter folkeregisterloven",
        master: "PDL",
        kilde: "folkeregisteret",
        fregGyldighetstidspunkt: "2021-01-01",
        erHistorisk: false,
      },
    ];
    props.historiskePersonstatuser = [
      {
        kode: "IKKE_BOSATT",
        tekst: "Bosatt utenfor Norge",
        master: "PDL",
        kilde: "folkeregisteret",
        fregGyldighetstidspunkt: "2001-01-01",
        erHistorisk: true,
      },
      {
        kode: "BOSATT",
        tekst: "Bosatt etter folkeregisterloven",
        master: "PDL",
        kilde: "folkeregisteret",
        fregGyldighetstidspunkt: "2000-03-25",
        erHistorisk: true,
      },
    ];
  });

  it("viser en Modal", () => {
    const personstatusModal = shallow(<PersonstatusModal {...props} />);

    const modal = personstatusModal.find(Nav.Modal);
    expect(modal).toHaveLength(1);
    expect(modal.props().onRequestClose).toBe(props.lukkModal);
  });

  it("viser tabell for aktiv personstatus og historiske personstatuser", () => {
    const personstatusModal = shallow(<PersonstatusModal {...props} />);

    const personstatusTabeller = personstatusModal.find(PersonstatusTabell);
    expect(personstatusTabeller).toHaveLength(2);
    expect(personstatusTabeller.first().props().personstatuser).toEqual(props.aktivePersonstatuser);
    expect(personstatusTabeller.last().props().personstatuser).toEqual(props.historiskePersonstatuser);
  });
});
