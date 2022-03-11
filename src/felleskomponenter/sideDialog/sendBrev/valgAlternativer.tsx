import React from "react";
import { DokumenterV2 } from "../../../services/api";
import * as Skjema from "../../skjema";

interface ValgAlternativProps {
  valg: DokumenterV2.Valg;
  feltKode: string;
  redigerbart: boolean;
}

const ValgAlternativer = ({ valg, feltKode, redigerbart }: ValgAlternativProps) => {
  if (valg.valgType === DokumenterV2.ValgType.RADIO) {
    return (
      <>
        {valg.valgAlternativer.map((alternativ) => (
          <Skjema.Radio
            feltNavn={`felt.${feltKode}.valg`}
            label={alternativ.beskrivelse}
            id={`${feltKode}.${alternativ.kode}`}
            key={`${feltKode}.${alternativ.kode}`}
            value={alternativ.beskrivelse}
            disabled={!redigerbart}
          />
        ))}
      </>
    );
  }
  if (valg.valgType === DokumenterV2.ValgType.SELECT) {
    return (
      <Skjema.Select feltNavn={`felt.${feltKode}.valg`} label="" emptyFieldText="Velg...">
        {valg.valgAlternativer.map((alternativ) => (
          <option key={alternativ.kode} value={alternativ.beskrivelse}>
            {alternativ.beskrivelse}
          </option>
        ))}
      </Skjema.Select>
    );
  }
  return null;
};

export default ValgAlternativer;
