import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { useDispatch } from "react-redux";
import { change } from "redux-form";
import PT from "prop-types";

import * as MPT from "../../../proptypes";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import * as Skjema from "../../../felleskomponenter/skjema";

import { JOURNALFORING_HENSIKT } from "../../../constants";

import OpprettSak, { OpprettSakTittel } from "./opprettSak";
import EnkeltSak from "./enkeltSak";
import KnyttTilSak from "./knyttTilSak";

import "./fagsakVelger.css";

const EKSISTRENDE = "Eksisterende sak";
const OPPRETT = "Opprett ny sak";

const FagsakVelger = (props) => {
  const { fagsakListe, settJournalforingHensikt, sakstemaToggleEnabled, landkoder } = props;
  const [valgtVisning, setValgtVisning] = useState(EKSISTRENDE);
  const dispatch = useDispatch();
  const ingenSakerFinnes = fagsakListe.length === 0;

  useEffect(() => {
    if (!sakstemaToggleEnabled) return;

    if (valgtVisning === OPPRETT || ingenSakerFinnes) {
      dispatch(change(KV.Form.JOURNALFORING, "saksnummer", "-1"));
    } else if (valgtVisning === EKSISTRENDE) {
      dispatch(change(KV.Form.JOURNALFORING, "saksnummer", ""));
    }
  }, [ingenSakerFinnes, valgtVisning, sakstemaToggleEnabled]);

  const notifier = async (saksnummer) => {
    const hensikt = saksnummer === "-1" ? JOURNALFORING_HENSIKT.OPPRETT : JOURNALFORING_HENSIKT.KNYTT;
    await settJournalforingHensikt(hensikt);
  };

  const radioValg = fagsakListe.reduce(
    (samling, sak) => [
      ...samling,
      {
        value: sak.saksnummer,
        innhold: <EnkeltSak sak={sak} sakstemaToggleEnabled={sakstemaToggleEnabled} landkoder={landkoder} />,
        footer: <KnyttTilSak sak={sak} sakstemaToggleEnabled={sakstemaToggleEnabled} />,
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
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

export default FagsakVelger;
