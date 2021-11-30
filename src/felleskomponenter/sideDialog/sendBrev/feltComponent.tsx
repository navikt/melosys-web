import React from "react";
import * as Skjema from "../../skjema";
import { Felt, FeltType } from "../../../services/modules/dokumenter-v2";
import { begrensAntallTegn } from "../../../utils/normalisering";
import BeskrivelseHjelpetekstComponent from "./beskrivelseHjelpetekst";

interface FeltComponentProps {
  felt: Felt;
  visHjelpetekst: boolean;
}
const FeltComponent = (props: FeltComponentProps) => {
  switch (props.felt?.feltType) {
    case FeltType.FRITEKST:
      return (
        <>
          {props.visHjelpetekst && (
            <BeskrivelseHjelpetekstComponent
              beskrivelse={props.felt.beskrivelse}
              hjelpetekst={props.felt.hjelpetekst}
            />
          )}
          <Skjema.HTMLEditor feltNavn={`felt.${props.felt.kode}.feltVerdi`} />
        </>
      );
    case FeltType.FRITEKST_STRING:
      return (
        <Skjema.Input
          feltNavn={`felt.${props.felt.kode}.feltVerdi`}
          normalize={begrensAntallTegn(props.felt.tegnBegrensning)}
          label={
            props.visHjelpetekst ? (
              <BeskrivelseHjelpetekstComponent
                beskrivelse={props.felt.beskrivelse}
                hjelpetekst={props.felt.hjelpetekst}
              />
            ) : (
              ""
            )
          }
        />
      );
    case FeltType.SJEKKBOKS:
      return <Skjema.Checkbox feltNavn={`felt.${props.felt.kode}.feltVerdi`} label={props.felt.beskrivelse} />;
    default:
      return <></>;
  }
};

export default FeltComponent;
