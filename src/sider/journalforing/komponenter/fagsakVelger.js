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
  const {
    fagsakListe,
    settJournalforingHensikt,
    behandleAlleSakerToggleEnabled,
    landkoder,
    erOpprettNySak,
    nullstillFormVerdier,
  } = props;
  const [valgtVisning, setValgtVisning] = useState(EKSISTRENDE);
  const dispatch = useDispatch();
  const ingenSakerFinnes = fagsakListe.length === 0;

  useEffect(() => {
    dispatch(change(KV.Form.OPPRETT_NY_SAK, "erEksisterendeSak", valgtVisning === EKSISTRENDE));
    if (nullstillFormVerdier) {
      nullstillFormVerdier();
    }
  }, [valgtVisning]);

  useEffect(() => {
    if (!behandleAlleSakerToggleEnabled) return;

    if (valgtVisning === OPPRETT || ingenSakerFinnes) {
      dispatch(change(KV.Form.JOURNALFORING, "saksnummer", "-1"));
    } else if (valgtVisning === EKSISTRENDE) {
      dispatch(change(KV.Form.JOURNALFORING, "saksnummer", ""));
    }
  }, [ingenSakerFinnes, valgtVisning, behandleAlleSakerToggleEnabled]);

  const notifier = async (saksnummer) => {
    const hensikt = saksnummer === "-1" ? JOURNALFORING_HENSIKT.OPPRETT : JOURNALFORING_HENSIKT.KNYTT;
    await settJournalforingHensikt(hensikt);
  };

  const radioValg = fagsakListe.reduce(
    (samling, sak) => [
      ...samling,
      {
        value: sak.saksnummer,
        innhold: (
          <EnkeltSak sak={sak} behandleAlleSakerToggleEnabled={behandleAlleSakerToggleEnabled} landkoder={landkoder} />
        ),
        footer: (
          <KnyttTilSak
            sak={sak}
            behandleAlleSakerToggleEnabled={behandleAlleSakerToggleEnabled}
            erOpprettNySak={erOpprettNySak}
          />
        ),
      },
    ],
    []
  );

  if (!behandleAlleSakerToggleEnabled) {
    radioValg.push({
      value: "-1",
      innhold: <OpprettSakTittel />,
      footer: <OpprettSak behandleAlleSakerToggleEnabled={false} />,
    });
  }
  if (behandleAlleSakerToggleEnabled) {
    return (
      <>
        {ingenSakerFinnes ? (
          <div className="fagsakVelger">
            <div className="ingenSaker">Ingen eksisterende saker funnet. Du må opprette en ny sak.</div>
            <OpprettSak behandleAlleSakerToggleEnabled />
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
                onChange={() => nullstillFormVerdier()}
                className="marginMellomCustomRadioPaneler"
              />
            )}
            {valgtVisning === OPPRETT && <OpprettSak behandleAlleSakerToggleEnabled />}
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
  behandleAlleSakerToggleEnabled: PT.bool.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  erOpprettNySak: PT.bool,
  nullstillFormVerdier: PT.func,
};

FagsakVelger.defaultProps = {
  erOpprettNySak: false,
  nullstillFormVerdier: undefined,
};

export default FagsakVelger;
