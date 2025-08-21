import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getFormSyncErrors, getFormValues } from "redux-form";
import { RootState } from "AppTypes";

import { DokumenterV2 } from "../../../services/api";
import * as Skjema from "../../skjema";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst";
import { BrevFelt, FeltVerdi, Melding, SendBrevFormValues, SyncErrors } from "./types";
import { hentFeltFeilmelding } from "./sendBrevSchema";

interface ValgAlternativProps {
  valg: DokumenterV2.Valg;
  feltKode: string;
  redigerbart: boolean;
  changeField: (felt: string, data: string | FeltVerdi | undefined) => void;
  beskrivelse: string;
  hjelpetekst: string | null;
  className?: string;
}

const lagLabel = (beskrivelse: string, hjelpetekst: string | null) => {
  return beskrivelse !== null ? (
    <LabelMedHjelpetekst label={beskrivelse} hjelpetekst={hjelpetekst} bold small />
  ) : (
    <span />
  );
};

// Liten helper: trekk ut tekst enten det er string eller { melding: string }
const unwrap = (v: unknown): string | undefined =>
  typeof v === "string"
    ? v
    : typeof v === "object" && v !== null && "melding" in v
      ? (v as Melding).melding
      : undefined;

function ValgAlternativer({
  valg,
  feltKode,
  redigerbart,
  changeField,
  beskrivelse,
  hjelpetekst,
  className,
}: ValgAlternativProps) {
  const syncErrors = useSelector((state: RootState) => getFormSyncErrors(KV.Form.SEND_BREV)(state)) as SyncErrors;
  const formValues = useSelector((state: RootState) => getFormValues(KV.Form.SEND_BREV)(state)) as SendBrevFormValues;

  // Sjekk om dette feltet er påkrevd og mangler verdi
  const erFeltPåkrevdOgMangler = () => {
    const valgtBrev = formValues?.valgtBrev;
    if (!valgtBrev?.felter) return false;

    const brevFelt = valgtBrev.felter.find((f: BrevFelt) => f.kode === feltKode);
    if (!brevFelt?.paakrevd) return false;

    const feltVerdi = formValues?.felt?.[feltKode];
    return !feltVerdi?.valg;
  };

  // Les nested feil fra schema for å kunne vise dem inline, selv om feltet ikke er paakrevd
  const nestedNode =
    syncErrors?.felt && typeof syncErrors.felt === "object"
      ? (syncErrors.felt as Record<string, { feltVerdi?: unknown; valg?: unknown } | undefined>)[feltKode]
      : undefined;
  const nestedFeltVerdiText = unwrap(nestedNode?.feltVerdi);
  const nestedValgText = unwrap(nestedNode?.valg);
  const harNestedFeil = Boolean(nestedFeltVerdiText || nestedValgText);

  const skalViseFeil = Boolean(formValues?.showFieldErrors) && (harNestedFeil || erFeltPåkrevdOgMangler());

  // Tekst under feltet: bruk kun valg-feil for SELECT; for andre felt kan feltVerdi brukes
  const erSelect = valg.valgType === DokumenterV2.ValgType.SELECT;
  const feilmelding: string | undefined = skalViseFeil
    ? erSelect
      ? nestedValgText ||
        (erFeltPåkrevdOgMangler() ? hentFeltFeilmelding(feltKode, beskrivelse || feltKode).melding : undefined)
      : nestedValgText || nestedFeltVerdiText || hentFeltFeilmelding(feltKode, beskrivelse || feltKode).melding
    : undefined;

  const label = lagLabel(beskrivelse, hjelpetekst);
  const valgalternativErSelectOgKunEtt =
    valg.valgType === DokumenterV2.ValgType.SELECT && valg.valgAlternativer.length === 1;

  useEffect(() => {
    if (valgalternativErSelectOgKunEtt) {
      changeField(`felt.${feltKode}.valg`, valg.valgAlternativer[0].kode);
    }
  }, [valg.valgType, valg.valgAlternativer.length, feltKode, changeField]);

  if (valg.valgType === DokumenterV2.ValgType.CHECKBOX) {
    return (
      <Nav.CheckboxGroup legend={label} name={`felt.${feltKode}.valg`} readOnly={!redigerbart} error={feilmelding}>
        {valg.valgAlternativer.map((alternativ) => (
          <Nav.Checkbox
            value={alternativ.kode}
            id={`${feltKode}.${alternativ.kode}`}
            key={`${feltKode}.${alternativ.kode}`}
            onChange={(a) => {
              if (a.target.checked) {
                // Slå på: sett valgt kode (rydder samtidig bort ev. feltVerdi)
                changeField(`felt.${feltKode}`, { valg: alternativ.kode });
              } else {
                // Slå av: fjern hele felt-noden for å unngå hengende verdier som kan ødlegge for validering
                changeField(`felt.${feltKode}`, undefined);
              }
            }}
          >
            {alternativ.beskrivelse}
          </Nav.Checkbox>
        ))}
      </Nav.CheckboxGroup>
    );
  }

  if (valg.valgType === DokumenterV2.ValgType.RADIO) {
    return (
      <Skjema.RadioGroup legend={label} name={`felt.${feltKode}.valg`} readOnly={!redigerbart} error={feilmelding}>
        <Nav.HStack gap="4">
          {valg.valgAlternativer.map((alternativ) => (
            <Nav.Radio
              value={alternativ.kode}
              id={`${feltKode}.${alternativ.kode}`}
              key={`${feltKode}.${alternativ.kode}`}
            >
              {alternativ.beskrivelse}
            </Nav.Radio>
          ))}
        </Nav.HStack>
      </Skjema.RadioGroup>
    );
  }

  if (valg.valgType === DokumenterV2.ValgType.SELECT) {
    return (
      <Skjema.Select
        className={className}
        feltNavn={`felt.${feltKode}.valg`}
        label={label}
        readonly={!redigerbart || valgalternativErSelectOgKunEtt}
        error={feilmelding}
      >
        {valg.valgAlternativer.map((alternativ) => (
          <option key={alternativ.kode} value={alternativ.kode}>
            {alternativ.beskrivelse}
          </option>
        ))}
      </Skjema.Select>
    );
  }

  return null;
}

export default ValgAlternativer;
