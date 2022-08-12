import React from "react";
import PT from "prop-types";

import * as Skjema from "../../../felleskomponenter/skjema";

import EnkeltSak from "./enkeltSak";
import KnyttTilSak from "./knyttTilSak";
import OpprettSak, { OpprettSakTittel } from "./opprettSak";
import MKV from "../../../melosyskodeverk";
import { JOURNALFORING_HENSIKT } from "../../../constants";
import { useFeatureToggle } from "../../../featuretoggle";

import "./fagsakVelger.css";

const {
  behandlinger: { behandlingstyper, behandlingstema },
  sakstyper,
} = MKV.Koder;

const valgbareBehandlingstyper = (sakstype, behtema, alltidNyBehandlingToggleEnabled) => {
  switch (sakstype) {
    case sakstyper.EU_EOS:
      return MKV.KTObjects.behandlinger.behandlingstyper.filter(({ kode }) => {
        if (alltidNyBehandlingToggleEnabled) {
          return (
            (behtema.kode === behandlingstema.UTSENDT_ARBEIDSTAKER && kode === behandlingstyper.ENDRET_PERIODE) ||
            kode === behandlingstyper.NY_VURDERING
          );
        }
        return kode === behandlingstyper.ENDRET_PERIODE;
      });
    case sakstyper.TRYGDEAVTALE:
      return MKV.KTObjects.behandlinger.behandlingstyper.filter(({ kode }) => kode === behandlingstyper.NY_VURDERING);
    default:
      return [];
  }
};

const FagsakVelger = (props) => {
  const alltidNyBehandlingToggle = useFeatureToggle("melosys.api.journalfoering.alltid.opprett.ny.behandling");
  const { fagsakListe, settJournalforingHensikt, sakstemaToggleEnabled } = props;
  const notifier = async (saksnummer) => {
    const hensikt = saksnummer === "-1" ? JOURNALFORING_HENSIKT.OPPRETT : JOURNALFORING_HENSIKT.KNYTT;
    await settJournalforingHensikt(hensikt);
  };
  const radioValg = fagsakListe.reduce(
    (samling, sak) => [
      ...samling,
      {
        value: sak.saksnummer,
        innhold: <EnkeltSak sak={sak} sakstemaToggleEnabled={sakstemaToggleEnabled} />,
        footer: (
          <KnyttTilSak
            sak={sak}
            behandlingstyper={valgbareBehandlingstyper(
              sak.sakstype.kode,
              sak.behandlingOversikter[0].behandlingstema,
              alltidNyBehandlingToggle === "enabled"
            )}
            sakstemaToggleEnabled={sakstemaToggleEnabled}
          />
        ),
      },
    ],
    []
  );
  radioValg.push({
    value: "-1",
    innhold: <OpprettSakTittel />,
    footer: <OpprettSak sakstemaToggleEnabled={sakstemaToggleEnabled} />,
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
  sakstemaToggleEnabled: PT.bool.isRequired,
};

export default FagsakVelger;
