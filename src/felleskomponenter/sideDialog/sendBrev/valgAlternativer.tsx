import { useEffect } from "react";
import { Controller } from "react-hook-form";

import { DokumenterV2 } from "../../../services/api";
import * as Forms from "../../forms";
import * as Nav from "../../../navFrontend";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst";
import { Felt } from "./types";
import { useSendBrevValidering, useSendBrevVerdier } from "./sendBrevValidering";
import { hentFeltFeilmelding } from "./sendBrevSchema";
import { vurderPåkrevdOgMangler } from "./sendBrevSchema";
import { unwrapMelding } from "../../skjema/utils";

interface ValgAlternativProps {
  valg: DokumenterV2.Valg;
  feltKode: string;
  redigerbart: boolean;
  changeField: (felt: string, data: string | Felt | undefined) => void;
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

export function applyCheckboxToggle({
  checked,
  feltKode,
  alternativKode,
  changeField,
}: {
  checked: boolean;
  feltKode: string;
  alternativKode: string;
  changeField: (felt: string, data: string | Felt | undefined) => void;
}) {
  if (checked) {
    // Slå på: sett valgt kode og rydd bort ev. fritekst
    changeField(`felt.${feltKode}.valg`, alternativKode);
    changeField(`felt.${feltKode}.feltVerdi`, undefined);
  } else {
    // Slå av: behold noden, men nullstill verdiene for konsistent datastruktur
    changeField(`felt.${feltKode}.valg`, undefined);
    changeField(`felt.${feltKode}.feltVerdi`, undefined);
  }
}

function ValgAlternativer({
  valg,
  feltKode,
  redigerbart,
  changeField,
  beskrivelse,
  hjelpetekst,
  className,
}: ValgAlternativProps) {
  const { feil: syncErrors, visFeil } = useSendBrevValidering();
  const formValues = useSendBrevVerdier();

  // Sjekk om dette feltet er påkrevd og mangler verdi
  const erFeltPåkrevdOgMangler = () => {
    const { erPaakrevd, valgMangler } = vurderPåkrevdOgMangler(formValues, feltKode);
    return erPaakrevd && valgMangler;
  };

  // Les nested feil fra schema for å kunne vise dem inline, selv om feltet ikke er paakrevd
  const nestedNode =
    syncErrors?.felt && typeof syncErrors.felt === "object"
      ? (syncErrors.felt as Record<string, Felt | undefined>)[feltKode]
      : undefined;
  const nestedFeltVerdiText = unwrapMelding(nestedNode?.feltVerdi);
  const nestedValgText = unwrapMelding(nestedNode?.valg);
  const harNestedFeil = Boolean(nestedFeltVerdiText || nestedValgText);

  const skalViseFeil = visFeil && (harNestedFeil || erFeltPåkrevdOgMangler());

  // Tekst under feltet: bruk kun valg-feil for SELECT; for andre felt kan feltVerdi brukes
  const erSelect = valg.valgType === DokumenterV2.ValgType.SELECT;
  const feilmelding: string | undefined = skalViseFeil
    ? erSelect
      ? nestedValgText || (erFeltPåkrevdOgMangler() ? hentFeltFeilmelding(feltKode).melding : undefined)
      : nestedValgText
    : undefined;

  const label = lagLabel(beskrivelse, hjelpetekst);
  const valgtKode = formValues?.felt?.[feltKode]?.valg;
  const valgalternativErSelectOgKunEtt =
    valg.valgType === DokumenterV2.ValgType.SELECT && valg.valgAlternativer.length === 1;

  useEffect(() => {
    if (valgalternativErSelectOgKunEtt) {
      changeField(`felt.${feltKode}.valg`, valg.valgAlternativer[0].kode);
    }
  }, [valg.valgType, valg.valgAlternativer.length, feltKode, changeField]);

  if (valg.valgType === DokumenterV2.ValgType.CHECKBOX) {
    return (
      <Nav.CheckboxGroup
        legend={label}
        name={`felt.${feltKode}.valg`}
        readOnly={!redigerbart}
        error={feilmelding}
        value={valgtKode ? [valgtKode] : []}
      >
        {valg.valgAlternativer.map((alternativ) => (
          <Nav.Checkbox
            value={alternativ.kode}
            id={`${feltKode}.${alternativ.kode}`}
            key={`${feltKode}.${alternativ.kode}`}
            onChange={(e) =>
              applyCheckboxToggle({
                checked: e.target.checked,
                feltKode,
                alternativKode: alternativ.kode,
                changeField,
              })
            }
          >
            {alternativ.beskrivelse}
          </Nav.Checkbox>
        ))}
      </Nav.CheckboxGroup>
    );
  }

  if (valg.valgType === DokumenterV2.ValgType.RADIO) {
    return (
      <Controller
        name={`felt.${feltKode}.valg`}
        render={({ field }) => (
          <Nav.RadioGroup
            legend={label}
            name={field.name}
            value={field.value ?? null}
            onChange={field.onChange}
            readOnly={!redigerbart}
            error={feilmelding}
          >
            <Nav.HStack gap="space-16">
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
          </Nav.RadioGroup>
        )}
      />
    );
  }

  if (valg.valgType === DokumenterV2.ValgType.SELECT) {
    return (
      <Forms.Select
        className={className}
        name={`felt.${feltKode}.valg`}
        label={label}
        readOnly={!redigerbart || valgalternativErSelectOgKunEtt}
        error={feilmelding}
      >
        {valg.valgAlternativer.map((alternativ) => (
          <option key={alternativ.kode} value={alternativ.kode}>
            {alternativ.beskrivelse}
          </option>
        ))}
      </Forms.Select>
    );
  }

  return null;
}

export default ValgAlternativer;
