import React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import BehandlingOppgave from "./behandlingOppgave";
import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";

describe("BehandlingOppgave", () => {
  const sak = {
    sisteNotat: "aaaaaaaaaaaaaaaaaaaaaaaa aaaaaa aaaaaaaaaaaa AAAAAAAA AAAAAAAAA AAAAAAAAAAAAA",
    oppgaveBeskrivelse: "linje 1 \nlinje 2 \nlinje 3 \n",
    behandling: {
      behandlingID: "1111",
      behandlingstema: {
        kode: MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL,
      },
      behandlingstype: {
        kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
      },
    },
    sakstype: {
      kode: "EU_EOS",
    },
    sakstema: {
      kode: "1111",
    },
  };
  const folketrygdenToggleEnabled = true;
  const landkoder = [
    { kode: "kode 1", term: "term 1" },
    { kode: "kode 2", term: "term 2" },
  ];
  const erUnderOppdatering = false;
  const behandlingstema = {
    kode: "test_code",
    term: "ttset",
  };

  const wrapper: ShallowWrapper = shallow(
    <BehandlingOppgave sak={sak} folketrygdenToggleEnabled={folketrygdenToggleEnabled} landkoder={landkoder} />
  );

  it("skal vise reversert rekkefølge og linjedeling", () => {
    expect(wrapper.find(".behandlingOppgave__kolonne__notater").find(Nav.Row).at(1).find("p").text()).toEqual(
      "linje 3 linje 2 linje 1 "
    );
  });

  it("skal vise forkortet notat", () => {
    expect(wrapper.find(".behandlingOppgave__kolonne__notater").find(Nav.Row).at(0).find("p").text()).toEqual(
      "aaaaaaaaaaaaaaaaaaaaaaaa aaaaaa aaaaaaaaaaaa AAAAAAAA AAAAAA (...)"
    );
  });
});
