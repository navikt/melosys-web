import React from "react";
import * as Skjema from "../../skjema";
import { Felt, FeltType } from "../../../services/modules/dokumenter-v2";
import { begrensAntallTegn } from "../../../utils/normalisering";
import FeltBeskrivelse from "./feltBeskrivelse";

interface BrevFeltProps {
  felt: Felt;
  visHjelpetekst: boolean;
}
const BrevFelt = (props: BrevFeltProps) => {
  switch (props.felt?.feltType) {
    case FeltType.FRITEKST:
      return (
        <>
          {props.visHjelpetekst && (
            <FeltBeskrivelse beskrivelse={props.felt.beskrivelse} hjelpetekst={props.felt.hjelpetekst} />
          )}
          <Skjema.HTMLEditor feltNavn={`felt.${props.felt.kode}.feltVerdi`} />
        </>
      );
    case FeltType.TEKST:
      return (
        <Skjema.Input
          feltNavn={`felt.${props.felt.kode}.feltVerdi`}
          normalize={begrensAntallTegn(props.felt.tegnBegrensning)}
          label={
            props.visHjelpetekst ? (
              <FeltBeskrivelse beskrivelse={props.felt.beskrivelse} hjelpetekst={props.felt.hjelpetekst} />
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

export default BrevFelt;
