import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { Controller, useFormState } from "react-hook-form";

import MKV from "../../../../melosyskodeverk";
import * as Forms from "../../../forms";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";

import { OrganisasjonOperations } from "../../../../ducks/organisasjoner";

import { DokumenterV2, Organisasjon } from "../../../../services/api";
import { OrganisasjonsAdresse } from "../../../adresser";
import BrevAdresse from "../../../adresser/brevAdresse";
import { SendBrevFormValues } from "../types";
import BrevMottakerNorskMyndighet from "./brevMottakerNorskMyndighet";
import { FeilmeldingProps, Underpunkt } from "../../../../services/modules/dokumenter-v2";
import LabelMedHjelpetekst from "../../../labelMedHjelpetekst";
import { unwrapMelding } from "../../../skjema/utils";
import { useSendBrevValidering, useSendBrevVerdier } from "../sendBrevValidering";

import "./brevMottaker.less";

const { BRUKER, ARBEIDSGIVER, VIRKSOMHET, ANNEN_ORGANISASJON, NORSK_MYNDIGHET, UTENLANDSK_TRYGDEMYNDIGHET } =
  MKV.Koder.mottakerroller;

export const erBruker = (rolle: string | undefined) => rolle === BRUKER;
export const erVirksomhet = (rolle: string | undefined) => rolle === VIRKSOMHET;
export const erArbeidsgiver = (rolle: string | undefined) => rolle === ARBEIDSGIVER;
export const erAnnenOrganisasjon = (rolle: string | undefined) => rolle === ANNEN_ORGANISASJON;
export const erNorskMyndighet = (rolle: string | undefined) => rolle === NORSK_MYNDIGHET;
export const erUtenlandskTrygdemyndighet = (rolle: string | undefined) => rolle === UTENLANDSK_TRYGDEMYNDIGHET;

export const skalViseBrevmalvalg = (formValues?: SendBrevFormValues): boolean => {
  const valgtMottaker = formValues?.valgtMottaker;
  if (!valgtMottaker || valgtMottaker.feilmelding) return false;
  if (erAnnenOrganisasjon(valgtMottaker.rolle)) {
    return (
      Boolean(formValues?.organisasjonsnummer) &&
      formValues?.organisasjonFunnetForOrgnr === formValues?.organisasjonsnummer
    );
  }
  return true;
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentOrganisasjon: (orgnr: string) => dispatch(OrganisasjonOperations.hent(orgnr)),
});

const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  redigerbart: boolean;
  tilgjengeligeMottakere: DokumenterV2.TilgjengeligMottaker[];
  changeField: (felt: string, data: any) => void;
}

function BrevMottaker({ tilgjengeligeMottakere, redigerbart, hentOrganisasjon, changeField }: Props & PropsFromRedux) {
  const formValues = useSendBrevVerdier();
  const { feil: syncErrors, visFeil } = useSendBrevValidering();
  const { touchedFields } = useFormState<SendBrevFormValues>({ name: "organisasjonsnummer" });
  const orgnrValid = !syncErrors.organisasjonsnummer;
  const orgnrFeil =
    touchedFields.organisasjonsnummer || visFeil ? unwrapMelding(syncErrors.organisasjonsnummer) : undefined;
  const arbeidsgiverFeil = visFeil ? unwrapMelding(syncErrors.arbeidsgiver) : undefined;
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

  const sisteForespurteOrgnrRef = useRef<string | undefined>(undefined);

  const hentOrganisasjonIfValid = async (data: { orgnr?: string; valid: boolean }) => {
    if (!data.valid || !data.orgnr) return;
    const response = await hentOrganisasjon(data.orgnr);
    if (data.orgnr !== sisteForespurteOrgnrRef.current) return;
    if (response.data.response) {
      setFeil({
        tittel:
          response.data.response.status === 404 ? "Kunne ikke finne organisasjon" : "Feil ved henting av organisasjon",
      });
      changeField("organisasjonFunnetForOrgnr", undefined);
    } else {
      setAdresse({ organisasjonsAdresse: response.data });
      changeField("organisasjonFunnetForOrgnr", data.orgnr);
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
          (mottakerAdresse: DokumenterV2.BrevAdresse) => mottakerAdresse.orgnr === formValues.arbeidsgiver,
        ),
      });

      if (valgtMottaker.adresser?.length === 1) {
        changeField("arbeidsgiver", valgtMottaker.adresser[0].orgnr);
      }
    }

    if (erAnnenOrganisasjon(valgtMottaker.rolle)) {
      changeField("organisasjonFunnetForOrgnr", undefined);
      sisteForespurteOrgnrRef.current = formValues.organisasjonsnummer;
      debouncedHentOrganisasjon({ orgnr: formValues.organisasjonsnummer, valid: orgnrValid });
    }
  }, [formValues?.mottaker, formValues?.organisasjonsnummer, orgnrValid, formValues?.arbeidsgiver]);
  return (
    <>
      <Forms.Select
        className="mottaker"
        name="mottaker"
        label={
          <LabelMedHjelpetekst
            label="Mottaker"
            hjelpetekst={
              tilgjengeligeMottakere.some((mottaker) => mottaker.rolle === VIRKSOMHET) ? null : mottakerHjelpetekst
            }
            bold
            small
          />
        }
        disabled={!redigerbart || tilgjengeligeMottakere?.length === 1}
        emptyFieldDisabled={!!formValues.mottaker}
      >
        {tilgjengeligeMottakere?.map((mottaker) => (
          <option key={mottaker.uuid} value={mottaker.uuid}>
            {mottaker.type}
          </option>
        ))}
      </Forms.Select>

      {(mottakerErBruker || mottakerErVirksomhet) && (
        <Nav.Row>
          <Nav.Column>
            {feil && (
              <Nav.Alert variant="error" className="alertstripe_feil">
                <Nav.BodyLong weight="semibold" size="small">
                  {feil.tittel}
                </Nav.BodyLong>
                {!Utils._isEmpty(feil.underpunkter) && (
                  <ul>
                    {feil.underpunkter?.map((item: Underpunkt) => (
                      <li key={item.underpunkt}>{item.underpunkt}</li>
                    ))}
                  </ul>
                )}
              </Nav.Alert>
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
              <Nav.Alert variant="error" className="alertstripe_feil">
                {feil.tittel}
              </Nav.Alert>
            </Nav.Column>
          ) : (
            <Nav.Column xs="12" className="arbeidsgiver">
              <Controller
                name="arbeidsgiver"
                render={({ field }) => (
                  <Nav.RadioGroup
                    legend={
                      <LabelMedHjelpetekst label="Velg arbeidsgiver" hjelpetekst={arbeidsgiverHjelptekst} bold small />
                    }
                    name={field.name}
                    value={field.value ?? null}
                    onChange={field.onChange}
                    error={arbeidsgiverFeil}
                  >
                    {formValues?.valgtMottaker?.adresser?.map((virksomhet: DokumenterV2.BrevAdresse) => (
                      <Fragment key={`arbeidsgiver.${virksomhet.orgnr}`}>
                        <Nav.Radio
                          readOnly={(formValues?.valgtMottaker?.adresser?.length ?? 0) === 1}
                          value={virksomhet.orgnr}
                        >
                          {`${virksomhet.mottakerNavn} (org.nr. ${virksomhet.orgnr})`}
                        </Nav.Radio>
                        {formValues.arbeidsgiver === virksomhet.orgnr && adresse?.mottakerAdresse && (
                          <BrevAdresse {...adresse?.mottakerAdresse} className="arbeidsgiver__adresse" />
                        )}
                      </Fragment>
                    ))}
                  </Nav.RadioGroup>
                )}
              />
            </Nav.Column>
          )}
        </Nav.Row>
      )}

      {mottakerErAnnenOrganisasjon && (
        <Nav.Row>
          <Nav.Column xs="4">
            <Forms.Input
              className="organisasjonsnummer"
              name="organisasjonsnummer"
              label="Org.nr."
              disabled={!redigerbart}
              error={orgnrFeil}
            />
          </Nav.Column>

          <Nav.Column xs="8">
            <Forms.Input
              className="kontaktperson"
              name="kontaktperson"
              label="Kontaktperson (valgfritt)"
              disabled={!redigerbart}
            />
          </Nav.Column>

          {adresse?.organisasjonsAdresse && (
            <Nav.Column xs="12">
              <OrganisasjonsAdresse
                className="organisasjonsAdresse"
                organisasjon={adresse.organisasjonsAdresse}
                visNavn
                boldNavn
                visTittel={false}
              />
            </Nav.Column>
          )}

          {feil && (
            <Nav.Column xs="12">
              <Nav.Alert variant="error" className="alertstripe_feil">
                {feil.tittel}
              </Nav.Alert>
            </Nav.Column>
          )}
        </Nav.Row>
      )}

      {mottakerErNorskMyndighet && <BrevMottakerNorskMyndighet changeField={changeField} />}

      {mottakerErUtenlandskTrygdemyndighet && feil && (
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Alert variant="error" className="alertstripe_feil">
              {feil.tittel}
            </Nav.Alert>
          </Nav.Column>
        </Nav.Row>
      )}
    </>
  );
}

export default connector(BrevMottaker);
