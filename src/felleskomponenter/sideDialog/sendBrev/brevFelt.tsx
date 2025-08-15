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
import * as StringUtils from "../../../utils/streng";
import "./brevFelt.less";
import { FeltVerdi, SendBrevFormValues, SyncErrors } from "./types";

interface BrevFeltProps {
  felt: DokumenterV2.Felt;
  visFeltBeskrivelse: boolean;
  width: ColumnWidth;
  redigerbart: boolean;
}

function BrevFelt({ felt, visFeltBeskrivelse, width, redigerbart }: BrevFeltProps) {
  const syncErrors = useSelector((state: RootState) => getFormSyncErrors(KV.Form.SEND_BREV)(state)) as SyncErrors;
  const formValues = useSelector((state: RootState) => getFormValues(KV.Form.SEND_BREV)(state)) as SendBrevFormValues;

  const manglerFeltVerdi = (felt: FeltVerdi | undefined): boolean => {
    if (!felt) return true;

    if ("valg" in felt && felt.valg !== undefined) {
      return !felt.valg;
    }

    return !StringUtils.harStrengInnhold(felt.feltVerdi);
  };
  // Sjekk om dette spesifikke feltet mangler utfylling og er påkrevd
  const erFeltPåkrevdOgMangler = () => {
    const valgtBrev = formValues?.valgtBrev;
    if (!valgtBrev?.felter) return false;

    const brevFelt = valgtBrev.felter.find((f) => f.kode === felt.kode);
    if (!brevFelt?.paakrevd) return false;

    const feltVerdi = formValues.felt?.[felt.kode];

    return manglerFeltVerdi(feltVerdi);
  };

  // Sjekk om hele skjemaet har felt-feil og dette feltet er påkrevd og mangler
  const harRelevantValidationFeil = () => {
    const visFelterFeil = Boolean(formValues?.showFieldErrors);
    if (!visFelterFeil) return false;

    // Sjekk om det er generell feltfeil og dette feltet er påkrevd og mangler
    const generellFeltFeil = syncErrors?.erFeltGyldig;
    if (generellFeltFeil && erFeltPåkrevdOgMangler()) {
      return true;
    }

    // Sjekk for felt-spesifikke feil
    const feltSpesifikkFeil =
      syncErrors?.[`felt.${felt.kode}.feltVerdi`] || syncErrors?.[`felt.${felt.kode}.valg`] || syncErrors?.[felt.kode];
    return !!feltSpesifikkFeil;
  };

  // Dette feltet skal vise feil hvis det har validation-feil
  const skalViseFeil = harRelevantValidationFeil();

  const feilmelding = skalViseFeil ? `${felt.beskrivelse || felt.kode} må fylles ut` : undefined;

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
