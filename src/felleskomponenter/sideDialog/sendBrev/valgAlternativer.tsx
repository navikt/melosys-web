import { DokumenterV2 } from "../../../services/api";
import * as Skjema from "../../skjema";

import "./valgAlternativer.css";

interface ValgAlternativProps {
  valg: DokumenterV2.Valg;
  feltKode: string;
  redigerbart: boolean;
  changeField: (felt: string, data: any) => void;
}

const vannretteSeksjoner = ["DISTRIBUSJONSTYPE"];

const ValgAlternativer = ({ valg, feltKode, redigerbart, changeField }: ValgAlternativProps) => {
  if (valg.valgType === DokumenterV2.ValgType.RADIO) {
    return (
      <div className="valgalternativer">
        <div className={vannretteSeksjoner.includes(feltKode) ? "vannrett" : ""}>
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
        </div>
      </div>
    );
  }
  if (valg.valgType === DokumenterV2.ValgType.SELECT) {
    if (valg.valgAlternativer.length === 1) {
      changeField(`felt.${feltKode}.valg`, valg.valgAlternativer[0].kode);
      return null;
    }
    return (
      <Skjema.Select feltNavn={`felt.${feltKode}.valg`} label="">
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
