import React, { useState } from "react";
import classNames from "classnames";
import PT from "prop-types";

import * as Nav from "../../../navFrontend";
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

const EKSISTRENDE = "Eksisterende sak";
const OPPRETT = "Opprett ny sak";

const FagsakVelger = (props) => {
  const alltidNyBehandlingToggle = useFeatureToggle("melosys.api.journalfoering.alltid.opprett.ny.behandling");
  const { fagsakListe, settJournalforingHensikt, sakstemaToggleEnabled } = props;
  const [valgtVisning, setValgtVisning] = useState(EKSISTRENDE);
  const ingenSakerFinnes = fagsakListe.length === 0;

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

  if (!sakstemaToggleEnabled) {
    radioValg.push({
      value: "-1",
      innhold: <OpprettSakTittel />,
      footer: <OpprettSak sakstemaToggleEnabled={false} />,
    });
  }

  if (sakstemaToggleEnabled) {
    return (
      <>
        {ingenSakerFinnes ? (
          <div className="fagsakVelger">
            <div className="ingenSaker">Ingen eksisterende saker funnet. Du må opprette en ny sak.</div>
            <OpprettSak sakstemaToggleEnabled />
          </div>
        ) : (
          <div className="fagsakVelger">
            <div className="velgVisning">
              <Nav.Radio
                label={EKSISTRENDE}
                className={classNames("visningValg", { "checked-valg": valgtVisning === EKSISTRENDE })}
                name="velgVisning"
                onChange={() => setValgtVisning(EKSISTRENDE)}
                checked={valgtVisning === EKSISTRENDE}
                value={EKSISTRENDE}
              />
              <Nav.Radio
                label={OPPRETT}
                className={classNames("visningValg", { "checked-valg": valgtVisning === OPPRETT })}
                name="velgVisning"
                onChange={() => setValgtVisning(OPPRETT)}
                checked={valgtVisning === OPPRETT}
                value={OPPRETT}
              />
            </div>
            {valgtVisning === EKSISTRENDE && (
              <Skjema.CustomRadioPanelGruppe
                feltNavn="saksnummer"
                radios={radioValg}
                notify={notifier}
                begrensVisteRadios
              />
            )}
            {valgtVisning === OPPRETT && <OpprettSak sakstemaToggleEnabled />}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="fagsakVelger">
      <Skjema.CustomRadioPanelGruppe feltNavn="saksnummer" radios={radioValg} notify={notifier} />
      {ingenSakerFinnes && "Ingen eksisterende saker funnet."}
    </div>
  );
};

FagsakVelger.propTypes = {
  fagsakListe: PT.array.isRequired,
  settJournalforingHensikt: PT.func.isRequired,
  sakstemaToggleEnabled: PT.bool.isRequired,
};

export default FagsakVelger;
