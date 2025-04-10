import { ColumnWidth } from "nav-frontend-grid";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../skjema";
import * as Utils from "../../../utils";
import { DokumenterV2 } from "../../../services/api";
import { begrensAntallTegn } from "../../../utils/normalisering";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst";
import { SendBrevFormValues } from "./types";

interface BrevFeltProps {
  felt: DokumenterV2.Felt;
  visFeltBeskrivelse: boolean;
  width: ColumnWidth;
  redigerbart: boolean;
  formErrors: Record<string, any>;
  formValues?: Partial<SendBrevFormValues>;
  visFeil?: boolean;
}

const hentFritekstFeil = (feltKode: string, formErrors: Record<string, any>): string | undefined => {
  const feltError = formErrors?.[`felt.${feltKode}.feltVerdi`];
  switch (feltKode) {
    case "FRITEKST":
      return Utils.feilmelding.hentEnkeltFeilmelding(feltError || formErrors?.fritekst);
    case "INNLEDNING_FRITEKST":
      return Utils.feilmelding.hentEnkeltFeilmelding(feltError || formErrors?.innledningFritekst);
    case "MANGLER_FRITEKST":
      return Utils.feilmelding.hentEnkeltFeilmelding(feltError || formErrors?.manglerFritekst);
    default:
      return Utils.feilmelding.hentEnkeltFeilmelding(feltError);
  }
};

function BrevFelt({ felt, visFeltBeskrivelse, width, redigerbart, formErrors, formValues, visFeil }: BrevFeltProps) {
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
            feil={visFeil ? hentFritekstFeil(felt.kode, formErrors) : undefined}
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
              error={
                visFeil && felt.kode === "BREV_TITTEL" && formValues?.felt?.BREV_TITTEL?.valg === "FRITEKST"
                  ? Utils.feilmelding.hentEnkeltFeilmelding(formErrors?.fritekstTittel)
                  : undefined
              }
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
              error={visFeil && formErrors?.type ? Utils.feilmelding.hentEnkeltFeilmelding(formErrors.type) : undefined}
            />
          </Nav.Column>
        </Nav.Row>
      );
    case DokumenterV2.FeltType.FORMTITTEL:
      return (
        <Nav.Row>
          <Nav.Column xs={width}>
            <LabelMedHjelpetekst label={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} bold small />
          </Nav.Column>
        </Nav.Row>
      );
    default:
      return null;
  }
}

export default BrevFelt;
