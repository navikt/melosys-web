import { DokumenterV2 } from "../../../services/api";
import * as Skjema from "../../skjema";
import * as Nav from "../../../navFrontend";

interface ValgAlternativProps {
  valg: DokumenterV2.Valg;
  feltKode: string;
  redigerbart: boolean;
  changeField: (felt: string, data: any) => void;
  feltVerdi?: {
    valg: string | null | undefined;
  };
}

const ValgAlternativer = ({ valg, feltKode, redigerbart, changeField, feltVerdi }: ValgAlternativProps) => {
  if (valg.valgType === DokumenterV2.ValgType.RADIO) {
    return (
      <Nav.RadioGroup legend="" hideLegend size="small" defaultValue={feltVerdi?.valg}>
        {valg.valgAlternativer.map((alternativ) => (
          <Skjema.Radio
            feltNavn={`felt.${feltKode}.valg`}
            label={alternativ.beskrivelse}
            id={`${feltKode}.${alternativ.kode}`}
            key={`${feltKode}.${alternativ.kode}`}
            value={alternativ.kode}
            disabled={!redigerbart}
          />
        ))}
      </Nav.RadioGroup>
    );
  }
  if (valg.valgType === DokumenterV2.ValgType.SELECT) {
    if (valg.valgAlternativer.length === 1) {
      changeField(`felt.${feltKode}.valg`, valg.valgAlternativer[0].kode);
      return null;
    }
    return (
      <Skjema.Select feltNavn={`felt.${feltKode}.valg`} label="" disabled={!redigerbart}>
        {valg.valgAlternativer.map((alternativ) => (
          <option key={alternativ.kode} value={alternativ.kode}>
            {alternativ.beskrivelse}
          </option>
        ))}
      </Skjema.Select>
    );
  }
  return null;
};

export default ValgAlternativer;
