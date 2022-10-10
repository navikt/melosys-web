import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
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
import { useFeatureToggle } from "../../../featuretoggle";

const EKSISTRENDE = "Eksisterende sak";
const OPPRETT = "Opprett ny sak";

const { JOURNALFORING_VALUES: FormValuesJournalforing, OPPRETT_NY_SAK_VALUES: FormValuesOpprettNySak } = KV.Form;

const FagsakVelger = (props) => {
  const {
    fagsakListe,
    settJournalforingHensikt,
    behandleAlleSakerToggleEnabled,
    landkoder,
    formValues,
    erOpprettNySak,
    nullstillFormVerdier,
  } = props;
  const [valgtVisning, setValgtVisning] = useState(erOpprettNySak ? OPPRETT : EKSISTRENDE);
  const [visToppValg, setVisToppValg] = useState(!erOpprettNySak);
  const [feltNavn, setFeltNavn] = useState(erOpprettNySak ? FormValuesOpprettNySak : FormValuesJournalforing);
  const nyOpprettSakToggle = useFeatureToggle("melosys.ny_opprett_sak");
  const { journalforingHensikt } = useSelector((state) => state.form?.journalforing?.values || {});

  const dispatch = useDispatch();
  const ingenSakerFinnes = fagsakListe.length === 0;

  useEffect(() => {
    dispatch(change(KV.Form.OPPRETT_NY_SAK, "erEksisterendeSak", valgtVisning === EKSISTRENDE));
    if (nullstillFormVerdier) {
      nullstillFormVerdier();
    }
  }, [valgtVisning]);

  useEffect(() => {
    if (
      journalforingHensikt === JOURNALFORING_HENSIKT.KNYTT ||
      journalforingHensikt === JOURNALFORING_HENSIKT.NY_VURDERING
    ) {
      setFeltNavn({ ...feltNavn, behandlingstema: "behandlingstema", behandlingstype: "behandlingstype" });
    }
  }, [journalforingHensikt]);

  useEffect(() => {
    if (erOpprettNySak && nyOpprettSakToggle === "enabled") {
      setVisToppValg(true);
    }
  }, [erOpprettNySak, nyOpprettSakToggle]);

  useEffect(() => {
    if (!behandleAlleSakerToggleEnabled) return;

    if (valgtVisning === OPPRETT || ingenSakerFinnes) {
      dispatch(change(KV.Form.JOURNALFORING, "saksnummer", "-1"));
    } else if (valgtVisning === EKSISTRENDE) {
      dispatch(change(KV.Form.JOURNALFORING, "saksnummer", ""));
    }
  }, [ingenSakerFinnes, valgtVisning, behandleAlleSakerToggleEnabled]);

  const notifier = async (saksnummer) => {
    if (settJournalforingHensikt && !erOpprettNySak) {
      const hensikt = saksnummer === "-1" ? JOURNALFORING_HENSIKT.OPPRETT : JOURNALFORING_HENSIKT.KNYTT;
      await settJournalforingHensikt(hensikt);
    }
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
            feltNavn={feltNavn}
            formValues={formValues}
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
      footer: <OpprettSak behandleAlleSakerToggleEnabled={false} formValues={formValues} feltNavn={feltNavn} />,
    });
  }

  if (behandleAlleSakerToggleEnabled) {
    return (
      <>
        {ingenSakerFinnes ? (
          <div className="fagsakVelger">
            <Nav.AlertStripeInfo>Ingen eksisterende saker funnet. Du må opprette en ny sak.</Nav.AlertStripeInfo>
            <OpprettSak behandleAlleSakerToggleEnabled formValues={formValues} feltNavn={feltNavn} />
          </div>
        ) : (
          <div className="fagsakVelger">
            <div className="velgVisning">
              {visToppValg && (
                <>
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
                </>
              )}
            </div>
            {valgtVisning === EKSISTRENDE && (
              <Skjema.CustomRadioPanelGruppe
                feltNavn="saksnummer"
                radios={radioValg}
                notify={notifier}
                begrensVisteRadios
                onChange={nullstillFormVerdier}
                className="marginMellomCustomRadioPaneler"
              />
            )}
            {valgtVisning === OPPRETT && (
              <OpprettSak behandleAlleSakerToggleEnabled formValues={formValues} feltNavn={feltNavn} />
            )}
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
  settJournalforingHensikt: PT.func,
  behandleAlleSakerToggleEnabled: PT.bool.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  formValues: PT.object.isRequired,
  erOpprettNySak: PT.bool,
  nullstillFormVerdier: PT.func,
};

FagsakVelger.defaultProps = {
  erOpprettNySak: false,
  nullstillFormVerdier: undefined,
  settJournalforingHensikt: undefined,
};

export default FagsakVelger;
