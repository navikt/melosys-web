import { useEffect, useState } from "react";
import classNames from "classnames";
import { useDispatch } from "react-redux";
import { change } from "redux-form";
import PT from "prop-types";

import * as MPT from "../../../proptypes";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import * as Skjema from "../../../felleskomponenter/skjema";

import { JOURNALFORING_HENSIKT } from "../../../constants";

import OpprettSak from "./opprettSak";
import EnkeltSak from "./enkeltSak";
import KnyttTilSak from "./knyttTilSak";

import "./fagsakVelger.css";

const EKSISTERENDE = "Eksisterende sak";
const OPPRETT = "Opprett ny sak";

const { JOURNALFORING_VALUES: FormValuesJournalforing, OPPRETT_NY_SAK_VALUES: FormValuesOpprettNySak } = KV.Form;

const FagsakVelger = (props) => {
  const { fagsakListe, settJournalforingHensikt, landkoder, formValues, erJournalføring, nullstillFormVerdier } = props;
  const [valgtVisning, setValgtVisning] = useState(EKSISTERENDE);
  const feltNavn = erJournalføring ? FormValuesJournalforing : FormValuesOpprettNySak;
  const dispatch = useDispatch();
  const ingenSakerFinnes = fagsakListe.length === 0;

  useEffect(() => {
    if (nullstillFormVerdier) {
      nullstillFormVerdier();
    }
  }, [valgtVisning]);

  useEffect(() => {
    if (valgtVisning === OPPRETT || ingenSakerFinnes) {
      dispatch(change(feltNavn.formNavn, feltNavn.saksnummer, "-1"));
    } else if (valgtVisning === EKSISTERENDE) {
      dispatch(change(feltNavn.formNavn, feltNavn.saksnummer, ""));
    }
  }, [ingenSakerFinnes, valgtVisning]);

  const notifier = async (saksnummer) => {
    if (erJournalføring && settJournalforingHensikt) {
      const hensikt = saksnummer === "-1" ? JOURNALFORING_HENSIKT.OPPRETT : JOURNALFORING_HENSIKT.KNYTT;
      await settJournalforingHensikt(hensikt);
    }
  };

  const radioValg = fagsakListe.reduce(
    (samling, sak) => [
      ...samling,
      {
        value: sak.saksnummer,
        innhold: <EnkeltSak sak={sak} landkoder={landkoder} />,
        footer: <KnyttTilSak sak={sak} erJournalføring={erJournalføring} feltNavn={feltNavn} formValues={formValues} />,
      },
    ],
    []
  );

  return (
    <div className="fagsakVelger">
      {ingenSakerFinnes ? (
        <>
          <Nav.AlertStripeInfo>Ingen eksisterende saker funnet. Du må opprette en ny sak.</Nav.AlertStripeInfo>
          <OpprettSak formValues={formValues} feltNavn={feltNavn} />
        </>
      ) : (
        <div className="velgVisning">
          <Nav.Radio
            label={EKSISTERENDE}
            className={classNames("visningValg", { "checked-valg": valgtVisning === EKSISTERENDE })}
            name="velgVisning"
            onChange={() => setValgtVisning(EKSISTERENDE)}
            checked={valgtVisning === EKSISTERENDE}
            value={EKSISTERENDE}
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
      {valgtVisning === OPPRETT && <OpprettSak formValues={formValues} feltNavn={feltNavn} />}
    </div>
  );
};

FagsakVelger.propTypes = {
  fagsakListe: PT.array.isRequired,
  settJournalforingHensikt: PT.func,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  formValues: PT.object.isRequired,
  erJournalføring: PT.bool.isRequired,
  nullstillFormVerdier: PT.func,
};

FagsakVelger.defaultProps = {
  nullstillFormVerdier: undefined,
  settJournalforingHensikt: undefined,
};

export default FagsakVelger;
