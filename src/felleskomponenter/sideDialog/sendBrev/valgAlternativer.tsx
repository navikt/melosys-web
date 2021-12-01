import React from "react";
import { DokumenterV2 } from "../../../services/api";
import * as Skjema from "../../skjema";

interface ValgAlternativProps {
  valg: DokumenterV2.Valg;
  feltKode: string;
  redigerbart: boolean;
}

const ValgAlternativer = (props: ValgAlternativProps) => {
  if (props.valg.valgType === DokumenterV2.ValgType.RADIO) {
    return (
      <>
        {props.valg.valgAlternativer.map((alternativ) => (
          <Skjema.Radio
            feltNavn={`felt.${props.feltKode}.valg`}
            label={alternativ.beskrivelse}
            id={`${props.feltKode}.${alternativ.kode}`}
            key={`${props.feltKode}.${alternativ.kode}`}
            value={alternativ.beskrivelse}
            disabled={!props.redigerbart}
          />
        ))}
      </>
    );
  } else if (props.valg.valgType === DokumenterV2.ValgType.SELECT) {
    return (
      <Skjema.Select feltNavn={`felt.${props.feltKode}.valg`} label="" emptyFieldText="Velg...">
        {props.valg.valgAlternativer.map((alternativ) => (
          <option key={alternativ.kode} value={alternativ.beskrivelse}>
            {alternativ.beskrivelse}
          </option>
        ))}
      </Skjema.Select>
    );
  }
  return <></>;
};

export default ValgAlternativer;
