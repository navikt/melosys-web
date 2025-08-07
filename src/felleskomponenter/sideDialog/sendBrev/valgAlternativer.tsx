import { useEffect } from "react";
import { DokumenterV2 } from "../../../services/api";
import * as Skjema from "../../skjema";
import * as Nav from "../../../navFrontend";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst";

interface ValgAlternativProps {
  valg: DokumenterV2.Valg;
  feltKode: string;
  redigerbart: boolean;
  changeField: (felt: string, data: string) => void;
  beskrivelse: string;
  hjelpetekst: string | null;
}

const renderLabel = (beskrivelse: string, hjelpetekst: string | null) => {
  return beskrivelse !== null ? (
    <LabelMedHjelpetekst label={beskrivelse} hjelpetekst={hjelpetekst} bold small />
  ) : (
    <span />
  );
};

function ValgAlternativer({ valg, feltKode, redigerbart, changeField, beskrivelse, hjelpetekst }: ValgAlternativProps) {
  const label = renderLabel(beskrivelse, hjelpetekst);
  const onlyOneSelectAlternative = valg.valgType === DokumenterV2.ValgType.SELECT && valg.valgAlternativer.length === 1;

  useEffect(() => {
    if (onlyOneSelectAlternative) {
      changeField(`felt.${feltKode}.valg`, valg.valgAlternativer[0].kode);
    }
  }, [valg.valgType, valg.valgAlternativer.length, feltKode, changeField]);

  if (valg.valgType === DokumenterV2.ValgType.CHECKBOX) {
    return (
      <Nav.CheckboxGroup legend={label} name={`felt.${feltKode}.valg`} readOnly={!redigerbart}>
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
      <Skjema.RadioGroup legend={label} name={`felt.${feltKode}.valg`} readOnly={!redigerbart}>
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
        feltNavn={`felt.${feltKode}.valg`}
        label={label}
        readonly={!redigerbart || onlyOneSelectAlternative}
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
