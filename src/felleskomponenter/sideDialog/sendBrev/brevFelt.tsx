import React from "react";
import * as Skjema from "../../skjema";
import { DokumenterV2 } from "../../../services/api";
import { begrensAntallTegn } from "../../../utils/normalisering";
import FeltBeskrivelse from "./feltBeskrivelse";

interface BrevFeltProps {
  felt: DokumenterV2.Felt;
  visHjelpetekst: boolean;
}
const BrevFelt = ({ felt, visHjelpetekst }: BrevFeltProps) => {
  switch (felt?.feltType) {
    case DokumenterV2.FeltType.FRITEKST:
      return (
        <>
          {visHjelpetekst && <FeltBeskrivelse beskrivelse={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} />}
          <Skjema.HTMLEditor feltNavn={`felt.${felt.kode}.feltVerdi`} />
        </>
      );
    case DokumenterV2.FeltType.TEKST:
      return (
        <Skjema.Input
          feltNavn={`felt.${felt.kode}.feltVerdi`}
          normalize={begrensAntallTegn(felt.tegnBegrensning)}
          label={
            visHjelpetekst ? <FeltBeskrivelse beskrivelse={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} /> : ""
          }
        />
      );
    case DokumenterV2.FeltType.SJEKKBOKS:
      return <Skjema.Checkbox feltNavn={`felt.${felt.kode}.feltVerdi`} label={felt.beskrivelse} />;
    default:
      return <></>;
  }
};

export default BrevFelt;
