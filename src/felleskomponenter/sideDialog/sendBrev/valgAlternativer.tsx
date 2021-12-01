import React from "react";
import { Valg, ValgType } from "../../../services/modules/dokumenter-v2";
import * as Skjema from "../../skjema";

interface ValgAlternativProps {
  valg: Valg;
  feltKode: string;
  redigerbart: boolean;
}

const ValgAlternativer: React.FC<ValgAlternativProps> = (props: ValgAlternativProps) => {
  if (props.valg.valgType === ValgType.RADIO) {
    const alternativer = props.valg.valgAlternativer.map((alternativ) => {
      return (
        <Skjema.Radio
          feltNavn={`felt.${props.feltKode}.valg`}
          label={alternativ.beskrivelse}
          id={`${props.feltKode}.${alternativ.kode}`}
          key={`${props.feltKode}.${alternativ.kode}`}
          value={alternativ.beskrivelse}
          disabled={!props.redigerbart}
        />
      );
    });
    return <React.Fragment>{alternativer}</React.Fragment>;
  } else if (props.valg.valgType === ValgType.SELECT) {
    const alternativer = props.valg.valgAlternativer.map((alternativ) => {
      return (
        <option key={alternativ.kode} value={alternativ.beskrivelse}>
          {alternativ.beskrivelse}
        </option>
      );
    });
    return (
      <Skjema.Select feltNavn={`felt.${props.feltKode}.valg`} label="" emptyFieldText="Velg...">
        {alternativer}
      </Skjema.Select>
    );
  }
  return <></>;
};

export default ValgAlternativer;
