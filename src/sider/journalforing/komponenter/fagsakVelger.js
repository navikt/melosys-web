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
import { useFeatureToggle } from "../../../featuretoggle";

const EKSISTERENDE = "Eksisterende sak";
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
  const [valgtVisning, setValgtVisning] = useState(EKSISTERENDE);
  const nyOpprettSakToggle = useFeatureToggle("melosys.ny_opprett_sak");
  const feltNavn = erOpprettNySak ? FormValuesOpprettNySak : FormValuesJournalforing;
  const dispatch = useDispatch();
  const ingenSakerFinnes = fagsakListe.length === 0;

  useEffect(() => {
    if (nullstillFormVerdier) {
      nullstillFormVerdier();
    }
  }, [valgtVisning]);

  useEffect(() => {
    if (!behandleAlleSakerToggleEnabled) return;

    if (valgtVisning === OPPRETT || ingenSakerFinnes) {
      dispatch(change(KV.Form.JOURNALFORING, "saksnummer", "-1"));
    } else if (valgtVisning === EKSISTERENDE) {
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
      <div className="fagsakVelger">
        {nyOpprettSakToggle !== "enabled" && erOpprettNySak ? (
          <OpprettSak behandleAlleSakerToggleEnabled formValues={formValues} feltNavn={feltNavn} />
        ) : (
          <>
            {ingenSakerFinnes ? (
              <>
                <Nav.AlertStripeInfo>Ingen eksisterende saker funnet. Du må opprette en ny sak.</Nav.AlertStripeInfo>
                <OpprettSak behandleAlleSakerToggleEnabled formValues={formValues} feltNavn={feltNavn} />
              </>
            ) : (
              <div className="velgVisning">
                <Nav.Radio
                  label={EKSISTERENDE}
                  className={classNames("visningValg", { "checked-valg": valgtVisning === EKSISTERENDE })}
                  name="velgVisning"
                  onChange={() => {
                    setValgtVisning(EKSISTERENDE);
                  }}
                  checked={valgtVisning === EKSISTERENDE}
                  value={EKSISTERENDE}
                />
                <Nav.Radio
                  label={OPPRETT}
                  className={classNames("visningValg", { "checked-valg": valgtVisning === OPPRETT })}
                  name="velgVisning"
                  onChange={() => {
                    setValgtVisning(OPPRETT);
                  }}
                  checked={valgtVisning === OPPRETT}
                  value={OPPRETT}
                />
              </div>
            )}
          </>
        )}

        {valgtVisning === EKSISTERENDE && (
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
    );
  }

  if ((!behandleAlleSakerToggleEnabled || nyOpprettSakToggle !== "enabled") && erOpprettNySak) {
    return (
      <OpprettSak
        behandleAlleSakerToggleEnabled={behandleAlleSakerToggleEnabled}
        formValues={formValues}
        feltNavn={feltNavn}
      />
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
