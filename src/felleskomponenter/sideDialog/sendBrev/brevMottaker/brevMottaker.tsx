import { Fragment, FocusEvent, useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { getFormValues } from "redux-form";

import MKV from "../../../../melosyskodeverk";
import * as Skjema from "../../../skjema";
import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";

import { OrganisasjonOperations } from "../../../../ducks/organisasjoner";
import { formSelectors } from "../../../../ducks/form";

import { DokumenterV2, Organisasjon } from "../../../../services/api";
import { OrganisasjonsAdresse } from "../../../adresser";
import BrevAdresse from "../../../adresser/brevAdresse";
import FeltBeskrivelse from "../feltBeskrivelse";
import { SendBrevFormValues } from "../types";
import BrevMottakerNorskMyndighet from "./brevMottakerNorskMyndighet";
import { FeilmeldingProps, Underpunkt } from "../../../../services/modules/dokumenter-v2";

const { BRUKER, ARBEIDSGIVER, VIRKSOMHET, ANNEN_ORGANISASJON, NORSK_MYNDIGHET, UTENLANDSK_TRYGDEMYNDIGHET } =
  MKV.Koder.mottakerroller;

export const erBruker = (rolle: string | undefined) => rolle === BRUKER;
export const erVirksomhet = (rolle: string | undefined) => rolle === VIRKSOMHET;
export const erArbeidsgiver = (rolle: string | undefined) => rolle === ARBEIDSGIVER;
export const erAnnenOrganisasjon = (rolle: string | undefined) => rolle === ANNEN_ORGANISASJON;
export const erNorskMyndighet = (rolle: string | undefined) => rolle === NORSK_MYNDIGHET;
export const erUtenlandskTrygdemyndighet = (rolle: string | undefined) => rolle === UTENLANDSK_TRYGDEMYNDIGHET;

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
  overstyrBlurEvent: (event: FocusEvent) => void;
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
  const [feil, setFeil] = useState<FeilmeldingProps | undefined>(undefined);
  const [adresse, setAdresse] = useState<{
    mottakerAdresse?: DokumenterV2.BrevAdresse;
    organisasjonsAdresse?: Organisasjon;
  }>();

  const mottakerErBruker = erBruker(formValues?.valgtMottaker?.rolle);
  const mottakerErVirksomhet = erVirksomhet(formValues?.valgtMottaker?.rolle);
  const mottakerErNorskMyndighet = erNorskMyndighet(formValues?.valgtMottaker?.rolle);
  const mottakerErArbeidsgiver = erArbeidsgiver(formValues?.valgtMottaker?.rolle);
  const mottakerErAnnenOrganisasjon = erAnnenOrganisasjon(formValues?.valgtMottaker?.rolle);
  const mottakerErUtenlandskTrygdemyndighet = erUtenlandskTrygdemyndighet(formValues?.valgtMottaker?.rolle);

  const mottakerHjelpetekst =
    "Hvis bruker eller arbeidsgiver har fullmektig som er lagt inn i sidemenyen, vil brevet automatisk bli sendt til denne.";
  const arbeidsgiverHjelptekst =
    "Hvis arbeidsgiveren du ønsker å sende brev til ikke vises her, må du legge til denne i sidemenyen under «Arbeidsgiver/virksomhet». Det samme gjelder hvis du skal legge til kontaktopplysninger.\n" +
    "Hvis arbeidsgiveren ikke er en nåværende arbeidsgiver, kan du velge «Annen organisasjon» som mottaker og legge den til manuelt.";

  const hentOrganisasjonIfValid = async (data: { orgnr?: string; valid: boolean }) => {
    if (!data.valid || !data.orgnr) return;
    const response = await hentOrganisasjon(data.orgnr);
    if (response.data.response) {
      setFeil({
        tittel:
          response.data.response.status === 404 ? "Kunne ikke finne organisasjon" : "Feil ved henting av organisasjon",
      });
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

    if (!Utils._isEmpty(valgtMottaker.feilmelding)) {
      setFeil(valgtMottaker.feilmelding);

      return;
    }

    if (erBruker(valgtMottaker.rolle)) {
      setAdresse({ mottakerAdresse: valgtMottaker.adresser ? valgtMottaker.adresser[0] : undefined });
    }

    if (erVirksomhet(valgtMottaker.rolle)) {
      setAdresse({ mottakerAdresse: valgtMottaker.adresser ? valgtMottaker.adresser[0] : undefined });
      changeField("arbeidsgiver", valgtMottaker.adresser && valgtMottaker.adresser[0].orgnr);
    }

    if (erArbeidsgiver(valgtMottaker.rolle)) {
      setAdresse({
        mottakerAdresse: valgtMottaker.adresser?.find(
          (mottakerAdresse: DokumenterV2.BrevAdresse) => mottakerAdresse.orgnr === formValues.arbeidsgiver
        ),
      });
    }

    if (erAnnenOrganisasjon(valgtMottaker.rolle)) {
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
            {feil && (
              <Nav.AlertStripeFeil className="alertstripe_feil">
                <Nav.Typo.Element>{feil.tittel}</Nav.Typo.Element>
                {!Utils._isEmpty(feil.underpunkter) && (
                  <ul>
                    {feil.underpunkter?.map((item: Underpunkt) => (
                      <li key={item.underpunkt}>{item.underpunkt}</li>
                    ))}
                  </ul>
                )}
              </Nav.AlertStripeFeil>
            )}
            {adresse?.mottakerAdresse && (
              <BrevAdresse {...adresse?.mottakerAdresse} className="brukeradresse" visNavn />
            )}
          </Nav.Column>
        </Nav.Row>
      )}

      {mottakerErArbeidsgiver && (
        <Nav.Row>
          {feil ? (
            <Nav.Column xs="12">
              <Nav.AlertStripeFeil className="alertstripe_feil">{feil.tittel}</Nav.AlertStripeFeil>
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
              {formValues?.valgtMottaker?.adresser?.map((virksomhet: DokumenterV2.BrevAdresse) => (
                <Fragment key={Utils._uuid()}>
                  <Skjema.Radio
                    className="arbeidsgiver__radio"
                    feltNavn="arbeidsgiver"
                    label={`${virksomhet.mottakerNavn} (org.nr. ${virksomhet.orgnr})`}
                    id={`arbeidsgiver.${virksomhet.orgnr}`}
                    key={`arbeidsgiver.${virksomhet.orgnr}`}
                    value={virksomhet.orgnr}
                    disabled={!redigerbart}
                  />
                  {formValues.arbeidsgiver === virksomhet.orgnr && adresse?.mottakerAdresse && (
                    <BrevAdresse {...adresse?.mottakerAdresse} className="arbeidsgiver__adresse" />
                  )}
                </Fragment>
              ))}
            </Nav.Column>
          )}
        </Nav.Row>
      )}

      {mottakerErAnnenOrganisasjon && (
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
              <Nav.AlertStripeFeil className="alertstripe_feil">{feil.tittel}</Nav.AlertStripeFeil>
            </Nav.Column>
          )}
        </Nav.Row>
      )}

      {mottakerErNorskMyndighet && <BrevMottakerNorskMyndighet />}

      {mottakerErUtenlandskTrygdemyndighet && feil && (
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.AlertStripeFeil className="alertstripe_feil">{feil.tittel}</Nav.AlertStripeFeil>
          </Nav.Column>
        </Nav.Row>
      )}
    </>
  );
};

export default connector(BrevMottaker);
