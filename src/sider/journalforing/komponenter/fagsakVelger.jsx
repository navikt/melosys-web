import { useEffect, useState } from "react";
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
import { HStack } from "@navikt/ds-react";
import { EnkelNavBox } from "../../../felleskomponenter/enkelNavBox";

const EKSISTERENDE = "Eksisterende sak";
const OPPRETT = "Opprett ny sak";

const { JournalforingValues: FormValuesJournalforing, OpprettNySakValues: FormValuesOpprettNySak } = KV.Form;

function FagsakVelger(props) {
  const {
    fagsakListe,
    settJournalforingHensikt = undefined,
    landkoder,
    formValues,
    erJournalføring,
    nullstillFormVerdier = undefined,
  } = props;
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
    [],
  );

  return (
    <div className="fagsakVelger">
      {ingenSakerFinnes ? (
        <>
          <Nav.Alert variant="info">Ingen eksisterende saker funnet. Du må opprette en ny sak.</Nav.Alert>
          <OpprettSak formValues={formValues} feltNavn={feltNavn} />
        </>
      ) : (
        <Nav.RadioGroup
          name="valgtVisning-radiogroup"
          defaultValue={valgtVisning}
          onChange={setValgtVisning}
          legend=""
          hideLegend
          size="medium"
          className="horisontal_radiogruppe"
        >
          <HStack gap="3" justify="space-between">
            <EnkelNavBox focused={valgtVisning === EKSISTERENDE}>
              <Nav.Radio value={EKSISTERENDE}>{EKSISTERENDE}</Nav.Radio>
            </EnkelNavBox>

            <EnkelNavBox focused={valgtVisning === OPPRETT}>
              <Nav.Radio value={OPPRETT}>{OPPRETT}</Nav.Radio>
            </EnkelNavBox>
          </HStack>
        </Nav.RadioGroup>
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
}

FagsakVelger.propTypes = {
  fagsakListe: PT.array.isRequired,
  settJournalforingHensikt: PT.func,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  formValues: PT.object.isRequired,
  erJournalføring: PT.bool.isRequired,
  nullstillFormVerdier: PT.func,
};

export default FagsakVelger;
