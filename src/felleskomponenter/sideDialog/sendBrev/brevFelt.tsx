import React from "react";
import * as Skjema from "../../skjema";
import { DokumenterV2 } from "../../../services/api";
import { begrensAntallTegn } from "../../../utils/normalisering";
import FeltBeskrivelse from "./feltBeskrivelse";

interface BrevFeltProps {
  felt: DokumenterV2.Felt;
  visHjelpetekst: boolean;
}
const BrevFelt = (props: BrevFeltProps) => {
  switch (props.felt?.feltType) {
    case DokumenterV2.FeltType.FRITEKST:
      return (
        <>
          {props.visHjelpetekst && (
            <FeltBeskrivelse beskrivelse={props.felt.beskrivelse} hjelpetekst={props.felt.hjelpetekst} />
          )}
          <Skjema.HTMLEditor feltNavn={`felt.${props.felt.kode}.feltVerdi`} />
        </>
      );
    case DokumenterV2.FeltType.TEKST:
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
    case DokumenterV2.FeltType.SJEKKBOKS:
      return <Skjema.Checkbox feltNavn={`felt.${props.felt.kode}.feltVerdi`} label={props.felt.beskrivelse} />;
    default:
      return <></>;
  }
};

export default BrevFelt;
