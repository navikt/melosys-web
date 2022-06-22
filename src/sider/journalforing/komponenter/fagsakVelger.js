import React from "react";
import PT from "prop-types";

import * as Skjema from "../../../felleskomponenter/skjema";

import EnkeltSak from "./enkeltSak";
import KnyttTilSak from "./knyttTilSak";
import OpprettSak, { OpprettSakTittel } from "./opprettSak";
import MKV from "../../../melosyskodeverk";
import { JOURNALFORING_HENSIKT } from "../../../constants";
import { erFeatureToggleEnabled } from "../../../featuretoggle";

import "./fagsakVelger.css";

const behandlingstyper = (sakstype, alltidNyBehandlingToggleEnabled) => {
  switch (sakstype) {
    case MKV.Koder.sakstyper.EU_EOS:
      return MKV.KTObjects.behandlinger.behandlingstyper.filter(
        ({ kode }) =>
          kode === MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE ||
          (alltidNyBehandlingToggleEnabled && kode === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING)
      );
    case MKV.Koder.sakstyper.TRYGDEAVTALE:
      return MKV.KTObjects.behandlinger.behandlingstyper.filter(
        ({ kode }) => kode === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING
      );
    default:
      return [];
  }
};

const FagsakVelger = (props) => {
  const alltidNyBehandlingToggleEnabled = erFeatureToggleEnabled(
    "melosys.api.journalfoering.alltid.opprett.ny.behandling"
  );
  const { fagsakListe, settJournalforingHensikt } = props;
  const notifier = async (saksnummer) => {
    const hensikt = saksnummer === "-1" ? JOURNALFORING_HENSIKT.OPPRETT : JOURNALFORING_HENSIKT.KNYTT;
    await settJournalforingHensikt(hensikt);
  };
  const radioValg = fagsakListe.reduce(
    (samling, sak) => [
      ...samling,
      {
        value: sak.saksnummer,
        innhold: <EnkeltSak sak={sak} />,
        footer: (
          <KnyttTilSak
            sak={sak}
            behandlingstyper={behandlingstyper(sak.sakstype.kode, alltidNyBehandlingToggleEnabled)}
          />
        ),
      },
    ],
    []
  );
  radioValg.push({
    value: "-1",
    innhold: <OpprettSakTittel />,
    footer: <OpprettSak />,
  });
  return (
    <div className="eksisterendeSaker">
      <Skjema.CustomRadioPanelGruppe feltNavn="saksnummer" radios={radioValg} notify={notifier} />
      {fagsakListe.length === 0 && "Ingen eksisterende saker funnet."}
    </div>
  );
};

FagsakVelger.propTypes = {
  fagsakListe: PT.array.isRequired,
  settJournalforingHensikt: PT.func.isRequired,
};

export default FagsakVelger;
