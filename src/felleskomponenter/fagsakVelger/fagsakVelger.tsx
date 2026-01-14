import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { change } from "redux-form";
import { HStack } from "@navikt/ds-react";
import { KTObject } from "@navikt/melosys-kodeverk";
import { AnyAction } from "redux";

import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";
import * as Skjema from "../skjema";
import { JOURNALFORING_HENSIKT } from "../../constants";
import { EnkelNavBox } from "../enkelNavBox";
import { Spinner } from "../spinner";
import { FagsakOppsummering } from "../../services/modules/types";

import OpprettSak from "./opprettSak";
import EnkeltSak from "./enkeltSak";
import KnyttTilSak from "./knyttTilSak";

import "./fagsakVelger.less";

const EKSISTERENDE = "Eksisterende sak";
const OPPRETT = "Opprett ny sak";

const { JournalforingValues: FormValuesJournalforing, OpprettNySakValues: FormValuesOpprettNySak } = KV.Form;

export interface FagsakVelgerProps {
  fagsakListe: FagsakOppsummering[];
  settJournalforingHensikt?: (hensikt: string) => Promise<void>;
  landkoder: KTObject[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formValues: any;
  erJournalføring: boolean;
  nullstillFormVerdier?: () => void;
  fagsakerHentes?: boolean;
}

function FagsakVelger({
  fagsakListe,
  settJournalforingHensikt,
  landkoder,
  formValues,
  erJournalføring,
  nullstillFormVerdier,
  fagsakerHentes = false,
}: FagsakVelgerProps) {
  const [valgtVisning, setValgtVisning] = useState(EKSISTERENDE);
  const feltNavn = erJournalføring ? FormValuesJournalforing : FormValuesOpprettNySak;
  const dispatch = useDispatch();
  const ingenSakerFinnes = fagsakListe.length === 0 && !fagsakerHentes;

  useEffect(() => {
    if (nullstillFormVerdier) {
      nullstillFormVerdier();
    }
  }, [valgtVisning]);

  useEffect(() => {
    if (valgtVisning === OPPRETT || ingenSakerFinnes) {
      dispatch(change(feltNavn.formNavn, feltNavn.saksnummer, "-1") as unknown as AnyAction);
    } else if (valgtVisning === EKSISTERENDE) {
      dispatch(change(feltNavn.formNavn, feltNavn.saksnummer, "") as unknown as AnyAction);
    }
  }, [ingenSakerFinnes, valgtVisning]);

  const notifier = async (saksnummer: string) => {
    if (erJournalføring && settJournalforingHensikt) {
      const hensikt = saksnummer === "-1" ? JOURNALFORING_HENSIKT.OPPRETT : JOURNALFORING_HENSIKT.KNYTT;
      await settJournalforingHensikt(hensikt);
    }
  };

  const radioValg = fagsakListe.reduce<
    Array<{
      value: string;
      innhold: React.ReactNode;
      footer: React.ReactNode;
    }>
  >(
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
      {fagsakerHentes && <Spinner />}
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

      {!fagsakerHentes && valgtVisning === EKSISTERENDE && (
        <Skjema.CustomRadioPanelGruppe
          feltNavn="saksnummer"
          radios={radioValg}
          notify={notifier}
          begrensVisteRadios
          onChange={nullstillFormVerdier}
          className="marginMellomCustomRadioPaneler"
        />
      )}
      {!fagsakerHentes && valgtVisning === OPPRETT && <OpprettSak formValues={formValues} feltNavn={feltNavn} />}
    </div>
  );
}

export default FagsakVelger;
