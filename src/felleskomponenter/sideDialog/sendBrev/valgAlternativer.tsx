import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getFormSyncErrors, getFormValues } from "redux-form";
import { RootState } from "AppTypes";

import { DokumenterV2 } from "../../../services/api";
import * as Skjema from "../../skjema";
import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst";

interface ValgAlternativProps {
  valg: DokumenterV2.Valg;
  feltKode: string;
  redigerbart: boolean;
  changeField: (felt: string, data: string) => void;
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

function ValgAlternativer({
  valg,
  feltKode,
  redigerbart,
  changeField,
  beskrivelse,
  hjelpetekst,
  className,
}: ValgAlternativProps) {
  const syncErrors = useSelector((state: RootState) => getFormSyncErrors(KV.Form.SEND_BREV)(state)) as any;
  const formValues = useSelector((state: RootState) => getFormValues(KV.Form.SEND_BREV)(state)) as any;

  // Sjekk om dette feltet er påkrevd og mangler verdi
  const erFeltPåkrevdOgMangler = () => {
    const valgtBrev = formValues?.valgtBrev;
    if (!valgtBrev?.felter) return false;

    const brevFelt = valgtBrev.felter.find((f: any) => f.kode === feltKode);
    if (!brevFelt?.paakrevd) return false;

    const feltVerdi = formValues.felt?.[feltKode];
    return !feltVerdi?.valg;
  };

  const skalViseFeil = syncErrors?.erFeltGyldig && erFeltPåkrevdOgMangler();
  const feilmelding = skalViseFeil ? `${beskrivelse || feltKode} må fylles ut` : undefined;

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
              changeField(`felt.${feltKode}.valg`, alternativ.kode);
              if (!a.target.checked) {
                changeField(`felt.${feltKode}.valg`, "");
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
