import { ColumnWidth } from "nav-frontend-grid";
import { useSelector } from "react-redux";
import { getFormSyncErrors, getFormValues } from "redux-form";
import { RootState } from "AppTypes";

import * as Nav from "../../../navFrontend";
import * as Skjema from "../../skjema";
import * as KV from "../../../kodeverk";
import { DokumenterV2 } from "../../../services/api";
import { begrensAntallTegn } from "../../../utils/normalisering";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst";
import "./brevFelt.less";
import { SendBrevFormValues, SyncErrors } from "./types";
import { hentFeltFeilmelding, vurderPåkrevdOgMangler } from "./sendBrevSchema";
import { unwrapMelding } from "../../skjema/utils";

interface BrevFeltProps {
  felt: DokumenterV2.Felt;
  visFeltBeskrivelse: boolean;
  width: ColumnWidth;
  redigerbart: boolean;
}

function BrevFelt({ felt, visFeltBeskrivelse, width, redigerbart }: BrevFeltProps) {
  const syncErrors = useSelector((state: RootState) => getFormSyncErrors(KV.Form.SEND_BREV)(state)) as
    | SyncErrors
    | undefined;
  const formValues = useSelector((state: RootState) => getFormValues(KV.Form.SEND_BREV)(state)) as SendBrevFormValues;

  // Sjekk om dette feltet er påkrevd og mangler verdi
  const erFeltPåkrevdOgMangler = () => {
    const { erPaakrevd, valgMangler, fritekstMangler } = vurderPåkrevdOgMangler(formValues, felt.kode);
    return erPaakrevd && (valgMangler || fritekstMangler);
  };

  const visFelterFeil = Boolean(formValues?.showFieldErrors);

  // Foretrukket: nested felt-feil fra schema
  const nestedNode =
    syncErrors?.felt && typeof syncErrors.felt === "object"
      ? (syncErrors.felt as Record<string, { feltVerdi?: unknown; valg?: unknown } | undefined>)[felt.kode]
      : undefined;

  const nestedFeltVerdiText = unwrapMelding(nestedNode?.feltVerdi);
  const nestedValgText = unwrapMelding(nestedNode?.valg);
  const harNestedFeil = Boolean(nestedFeltVerdiText || nestedValgText);

  // Når skal vi vise feil under feltet?
  const skalViseFeil = visFelterFeil && (harNestedFeil || (syncErrors?.erFeltGyldig && erFeltPåkrevdOgMangler()));

  // Tekst under feltet: bruk nested først, ellers generisk
  const feilmelding = skalViseFeil
    ? nestedFeltVerdiText || nestedValgText || hentFeltFeilmelding(felt.kode).melding
    : undefined;

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
            error={feilmelding}
            // Send brev (sidemenyen): her kan brukeren også sette inn hele brevmaler.
            visBrevmaler
            // Her er det plass til å utvide editoren forbi brevbredden.
            visBreddeToggle
            // Skjul meta.error før innsending (vis først når showFieldErrors er true)
            suppressMetaError={!formValues?.showFieldErrors}
          />
        </>
      );
    case DokumenterV2.FeltType.TEKST: {
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
              disabled={!redigerbart}
              error={feilmelding}
            />
          </Nav.Column>
        </Nav.Row>
      );
    }
    case DokumenterV2.FeltType.SJEKKBOKS:
      return (
        <Nav.Row className="brevfelt__sjekkboks">
          <Nav.Column xs={width}>
            <Skjema.Checkbox
              feltNavn={`felt.${felt.kode}.feltVerdi`}
              label={felt.beskrivelse}
              disabled={!redigerbart}
              error={feilmelding}
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
      // Håndter felt med valg (dropdown/select)
      if (felt?.valg?.valgAlternativer) {
        return (
          <Nav.Row>
            <Nav.Column xs={width}>
              <Skjema.Select
                feltNavn={`felt.${felt.kode}.valg`}
                label={
                  visFeltBeskrivelse ? (
                    <LabelMedHjelpetekst label={felt.beskrivelse} hjelpetekst={felt.hjelpetekst} bold small />
                  ) : (
                    ""
                  )
                }
                disabled={!redigerbart}
                error={feilmelding}
              >
                {felt.valg.valgAlternativer.map((alternativ) => (
                  <option key={alternativ.kode} value={alternativ.kode}>
                    {alternativ.beskrivelse}
                  </option>
                ))}
              </Skjema.Select>
            </Nav.Column>
          </Nav.Row>
        );
      }
      return null;
  }
}

export default BrevFelt;
