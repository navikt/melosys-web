import React from "react";
import { ColumnWidth } from "nav-frontend-grid";

import * as Nav from "../../../navFrontend";
import * as Skjema from "../../skjema";

import { DokumenterV2 } from "../../../services/api";
import { begrensAntallTegn } from "../../../utils/normalisering";
import FeltBeskrivelse from "./feltBeskrivelse";

interface BrevFeltProps {
  felt: DokumenterV2.Felt;
  visFeltBeskrivelse: boolean;
  width: ColumnWidth;
}
const BrevFelt = ({ felt, visFeltBeskrivelse, width }: BrevFeltProps) => {
  switch (felt?.feltType) {
    case DokumenterV2.FeltType.FRITEKST:
      return (
        <>
          {visFeltBeskrivelse && <FeltBeskrivelse beskrivelse={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} />}
          <Skjema.HTMLEditor feltNavn={`felt.${felt.kode}.feltVerdi`} className="brevfelt__fritekst" />
        </>
      );
    case DokumenterV2.FeltType.TEKST: {
      const placeholder = `Skriv inn ${felt.beskrivelse.toLowerCase()}`;
      const placeholderMaksAntallTegn = felt.tegnBegrensning ? `, maks ${felt.tegnBegrensning} tegn` : "";
      return (
        <Nav.Row>
          <Nav.Column xs={width}>
            <Skjema.Input
              feltNavn={`felt.${felt.kode}.feltVerdi`}
              normalize={begrensAntallTegn(felt.tegnBegrensning)}
              label={
                visFeltBeskrivelse ? (
                  <FeltBeskrivelse beskrivelse={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} />
                ) : (
                  ""
                )
              }
              placeholder={`${placeholder}${placeholderMaksAntallTegn}`}
            />
          </Nav.Column>
        </Nav.Row>
      );
    }
    case DokumenterV2.FeltType.SJEKKBOKS:
      return (
        <Nav.Row>
          <Nav.Column xs={width}>
            <Skjema.Checkbox
              feltNavn={`felt.${felt.kode}.feltVerdi`}
              label={felt.beskrivelse}
              className="brevfelt__sjekkboks"
            />
          </Nav.Column>
        </Nav.Row>
      );
    default:
      return null;
  }
};

export default BrevFelt;
