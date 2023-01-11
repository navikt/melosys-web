import React, { Fragment, useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { getFormValues } from "redux-form";

import * as Skjema from "../../../skjema";
import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";

import { OrganisasjonOperations } from "../../../../ducks/organisasjoner";
import { formSelectors } from "../../../../ducks/form";

import { DokumenterV2, Organisasjon } from "../../../../services/api";
import { OrganisasjonsAdresse } from "../../../adresser";
import MottakerAdresse from "../mottakerAdresse";
import FeltBeskrivelse from "../feltBeskrivelse";
import { SendBrevFormValues } from "../types";

const { BRUKER, ARBEIDSGIVER, VIRKSOMHET } = KV.Koder.MottakerRolle;

const erBruker = (rolle: string | undefined) => rolle === BRUKER;
const erVirksomhet = (rolle: string | undefined) => rolle === VIRKSOMHET;
const erArbeidsgiver = (rolle: string | undefined) => rolle === ARBEIDSGIVER;
export const erArbeidsgiverEllerVirksomhet = (rolle: string | undefined) =>
  erArbeidsgiver(rolle) || erVirksomhet(rolle);

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.SEND_BREV)(state) as SendBrevFormValues,
  orgnrValid: formSelectors.SendBrevOrgnummerValidSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentOrganisasjon: (orgnr: string) => dispatch(OrganisasjonOperations.hent(orgnr)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  redigerbart: boolean;
  tilgjengeligeMottakere: DokumenterV2.TilgjengeligMottaker[];
  changeField: (felt: string, data: any) => void;
  overstyrBlurEvent: (event: React.FocusEvent) => void;
}

const BrevMottaker = ({
  tilgjengeligeMottakere,
  formValues,
  redigerbart,
  hentOrganisasjon,
  orgnrValid,
  changeField,
  overstyrBlurEvent,
}: Props & PropsFromRedux) => {
  const [feil, setFeil] = useState<string>();
  const [adresse, setAdresse] = useState<{
    mottakerAdresse?: DokumenterV2.MottakerAdresse;
    organisasjonsAdresse?: Organisasjon;
  }>();

  const mottakerErBruker = erBruker(formValues?.valgtMottaker?.rolle);
  const mottakerErVirksomhet = erVirksomhet(formValues?.valgtMottaker?.rolle);
  const mottakerErArbeidsgiver =
    erArbeidsgiver(formValues?.valgtMottaker?.rolle) && !formValues?.valgtMottaker?.orgnrSettesAvSaksbehandler;
  const mottakerOrgNrSettesAvSaksbehandler =
    erArbeidsgiverEllerVirksomhet(formValues?.valgtMottaker?.rolle) &&
    formValues?.valgtMottaker?.orgnrSettesAvSaksbehandler;

  const mottakerHjelpetekst =
    "Hvis bruker eller arbeidsgiver har fullmektig som er lagt inn i sidemenyen, vil brevet automatisk bli sendt til denne.";
  const arbeidsgiverHjelptekst =
    "Hvis arbeidsgiveren du ønsker å sende brev til ikke vises her, må du legge til denne i sidemenyen under «Arbeidsgiver/virksomhet». Det samme gjelder hvis du skal legge til kontaktopplysninger.\n" +
    "Hvis arbeidsgiveren ikke er en nåværende arbeidsgiver, kan du velge «Annen organisasjon» som mottaker og legge den til manuelt.";

  const hentOrganisasjonIfValid = async (data: { orgnr?: string; valid: boolean }) => {
    if (!data.valid || !data.orgnr) return;
    const response = await hentOrganisasjon(data.orgnr);
    if (response.data.response) {
      setFeil(
        response.data.response.status === 404 ? "Kunne ikke finne organisasjon" : "Feil ved henting av organisasjon"
      );
    } else {
      setAdresse({ organisasjonsAdresse: response.data });
    }
  };

  const debouncedHentOrganisasjon = useCallback(Utils._debounce(hentOrganisasjonIfValid, 500), []);

  useEffect(() => {
    setAdresse(undefined);
    setFeil(undefined);
    changeField("type", undefined);

    const valgtMottaker = tilgjengeligeMottakere.find((mottaker) => mottaker.uuid === formValues.mottaker);
    changeField("valgtMottaker", valgtMottaker);
    if (!valgtMottaker) return;

    if (valgtMottaker.feilmelding) {
      setFeil(valgtMottaker.feilmelding);
      return;
    }

    if (erBruker(valgtMottaker.rolle)) {
      setAdresse({ mottakerAdresse: valgtMottaker.adresser ? valgtMottaker.adresser[0] : undefined });
    }

    if (erVirksomhet(valgtMottaker.rolle)) {
      setAdresse({ mottakerAdresse: valgtMottaker.adresser ? valgtMottaker.adresser[0] : undefined });
      changeField("arbeidsgiver", valgtMottaker.adresser && valgtMottaker.adresser[0].tittel.orgnr);
    }

    if (erArbeidsgiver(valgtMottaker.rolle) && !valgtMottaker.orgnrSettesAvSaksbehandler) {
      setAdresse({
        mottakerAdresse: valgtMottaker.adresser?.find(
          (mottakerAdresse: DokumenterV2.MottakerAdresse) => mottakerAdresse.tittel.orgnr === formValues.arbeidsgiver
        ),
      });
    }

    if (erArbeidsgiverEllerVirksomhet(valgtMottaker.rolle) && valgtMottaker.orgnrSettesAvSaksbehandler) {
      debouncedHentOrganisasjon({ orgnr: formValues.organisasjonsnummer, valid: orgnrValid });
    }
  }, [formValues?.mottaker, formValues?.organisasjonsnummer, orgnrValid, formValues?.arbeidsgiver]);

  return (
    <>
      <Skjema.Select
        feltNavn="mottaker"
        label={
          <FeltBeskrivelse
            beskrivelse="Mottaker"
            hjelpetekst={
              tilgjengeligeMottakere.some((mottaker) => mottaker.rolle === VIRKSOMHET) ? null : mottakerHjelpetekst
            }
          />
        }
        disabled={!redigerbart || tilgjengeligeMottakere?.length === 1}
        emptyFieldText="Velg..."
        emptyFieldDisabled={!!formValues.mottaker}
        onBlur={overstyrBlurEvent}
      >
        {tilgjengeligeMottakere?.map((mottaker) => (
          <option key={mottaker.uuid} value={mottaker.uuid}>
            {mottaker.type}
          </option>
        ))}
      </Skjema.Select>

      {(mottakerErBruker || mottakerErVirksomhet) && (
        <Nav.Row>
          <Nav.Column xs="12">
            {feil && <Nav.AlertStripeFeil className="alertstripe_feil">{feil}</Nav.AlertStripeFeil>}
            {adresse?.mottakerAdresse && (
              <MottakerAdresse {...adresse?.mottakerAdresse} className="brukeradresse" visNavn />
            )}
          </Nav.Column>
        </Nav.Row>
      )}

      {mottakerErArbeidsgiver && (
        <Nav.Row>
          {feil ? (
            <Nav.Column xs="12">
              <Nav.AlertStripeFeil className="alertstripe_feil">{feil}</Nav.AlertStripeFeil>
            </Nav.Column>
          ) : (
            <Nav.Column xs="12" className="arbeidsgiver">
              <Nav.Typo.Normaltekst tag="div">
                Velg:
                {formValues?.valgtMottaker?.rolle === ARBEIDSGIVER && (
                  <Nav.Hjelpetekst
                    className="hjelpetekst"
                    tittel={arbeidsgiverHjelptekst}
                    type={Nav.PopoverOrientering.Venstre}
                  >
                    {arbeidsgiverHjelptekst}
                  </Nav.Hjelpetekst>
                )}
              </Nav.Typo.Normaltekst>
              {formValues?.valgtMottaker?.adresser?.map((virksomhet: DokumenterV2.MottakerAdresse) => (
                <Fragment key={Utils._uuid()}>
                  <Skjema.Radio
                    className="arbeidsgiver__radio"
                    feltNavn="arbeidsgiver"
                    label={`${virksomhet.tittel.mottakerNavn} (org.nr. ${virksomhet.tittel.orgnr})`}
                    id={`arbeidsgiver.${virksomhet.tittel.orgnr}`}
                    key={`arbeidsgiver.${virksomhet.tittel.orgnr}`}
                    value={virksomhet.tittel.orgnr}
                    disabled={!redigerbart}
                  />
                  {formValues.arbeidsgiver === virksomhet.tittel.orgnr && adresse?.mottakerAdresse && (
                    <MottakerAdresse {...adresse?.mottakerAdresse} className="arbeidsgiver__adresse" />
                  )}
                </Fragment>
              ))}
            </Nav.Column>
          )}
        </Nav.Row>
      )}

      {mottakerOrgNrSettesAvSaksbehandler && (
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.Input
              feltNavn="organisasjonsnummer"
              label="Organisasjonsnummer"
              placeholder="Skriv inn"
              disabled={!redigerbart}
            />
            {adresse?.organisasjonsAdresse && (
              <OrganisasjonsAdresse
                className="organisasjonsAdresse"
                organisasjon={adresse.organisasjonsAdresse}
                visNavn
                boldNavn
                visTittel={false}
              />
            )}
          </Nav.Column>
          <Nav.Column xs="6">
            <Skjema.Input
              feltNavn="kontaktperson"
              label="Kontaktperson"
              placeholder="Skriv inn"
              disabled={!redigerbart}
            />
          </Nav.Column>
          {feil && (
            <Nav.Column xs="12">
              <Nav.AlertStripeFeil className="alertstripe_feil">{feil}</Nav.AlertStripeFeil>
            </Nav.Column>
          )}
        </Nav.Row>
      )}
    </>
  );
};

export default connector(BrevMottaker);
