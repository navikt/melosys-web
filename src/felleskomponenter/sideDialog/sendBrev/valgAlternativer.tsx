import { DokumenterV2 } from "../../../services/api";
import * as Skjema from "../../skjema";
import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst";

interface ValgAlternativProps {
  valg: DokumenterV2.Valg;
  feltKode: string;
  redigerbart: boolean;
  changeField: (felt: string, data: any) => void;
  beskrivelse: string;
  hjelpetekst: string | null;
  formErrors: Record<string, any>;
  formValues?: Record<string, any>;
  visFeil?: boolean;
}

const renderLabel = (beskrivelse: string, hjelpetekst: string | null) => {
  return beskrivelse != null ? (
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
  formErrors,
  formValues,
  visFeil,
}: ValgAlternativProps) {
  const label = renderLabel(beskrivelse, hjelpetekst);
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
      <Skjema.RadioGroup
        legend={label}
        name={`felt.${feltKode}.valg`}
        readOnly={!redigerbart}
        error={
          visFeil && (formErrors.type || (feltKode === "DISTRIBUSJONSTYPE" && formErrors.felt?.DISTRIBUSJONSTYPE))
            ? Utils.feilmelding.hentEnkeltFeilmelding(formErrors.type || formErrors.felt?.DISTRIBUSJONSTYPE)
            : undefined
        }
      >
        <Nav.HStack gap="3">
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
    if (valg.valgAlternativer.length === 1) {
      changeField(`felt.${feltKode}.valg`, valg.valgAlternativer[0].kode);
      return null;
    }
    return (
      <Skjema.Select
        feltNavn={`felt.${feltKode}.valg`}
        label={label}
        disabled={!redigerbart}
        error={
          visFeil &&
          feltKode === "BREV_TITTEL" &&
          formErrors.fritekstTittel &&
          (!formValues?.felt?.BREV_TITTEL?.valg || formValues?.felt?.BREV_TITTEL?.valg !== "FRITEKST")
            ? Utils.feilmelding.hentEnkeltFeilmelding(formErrors.fritekstTittel)
            : undefined
        }
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
