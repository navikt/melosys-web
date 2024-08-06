import { ColumnWidth } from "nav-frontend-grid";

import * as Nav from "../../../navFrontend";
import * as Skjema from "../../skjema";

import { DokumenterV2 } from "../../../services/api";
import { begrensAntallTegn } from "../../../utils/normalisering";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst";

interface BrevFeltProps {
  felt: DokumenterV2.Felt;
  visFeltBeskrivelse: boolean;
  width: ColumnWidth;
  redigerbart: boolean;
}
const BrevFelt = ({ felt, visFeltBeskrivelse, width, redigerbart }: BrevFeltProps) => {
  switch (felt?.feltType) {
    case DokumenterV2.FeltType.FRITEKST:
      return (
        <>
          {visFeltBeskrivelse && (
            <LabelMedHjelpetekst label={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} bold small />
          )}
          <Skjema.HTMLEditor
            feltNavn={`felt.${felt.kode}.feltVerdi`}
            className="brevfelt__fritekst"
            disabled={!redigerbart}
          />
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
                  <LabelMedHjelpetekst label={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} bold small />
                ) : (
                  ""
                )
              }
              placeholder={`${placeholder}${placeholderMaksAntallTegn}`}
              disabled={!redigerbart}
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
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      );
    case DokumenterV2.FeltType.FORMTITTEL:
      return (
        <Nav.Row>
          <LabelMedHjelpetekst label={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} bold small />
        </Nav.Row>
      );
    default:
      return null;
  }
};

export default BrevFelt;
