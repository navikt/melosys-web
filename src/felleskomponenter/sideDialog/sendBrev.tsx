import React, { Fragment, useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { change, getFormValues, reduxForm } from "redux-form";
import { Organisasjon } from "Domene";
import { KTObject } from "@navikt/melosys-kodeverk";
import { AlertStripeFeil } from "nav-frontend-alertstriper";

import * as Api from "../../services/api";
import * as KV from "../../kodeverk";
import MKV from "../../melosyskodeverk";
import * as Nav from "../../utils/navFrontend";
import * as Skjema from "../skjema";
import * as Utils from "../../utils";

import { fagsakSelectors } from "../../ducks/fagsaker";
import { OrganisasjonOperations } from "../../ducks/organisasjoner";
import { OrganisasjonsAdresse, UstrukturertAdresse } from "../adresser";
import finnKontaktopplysninger from "../menypanel/menypunkter/kontaktopplysninger/finnKontaktopplysninger";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { UstrukturertAdresse as Ustrukturert } from "../../@types";
import { lagYupToReduxformErrorMapper } from "../../yup";
import { formSelectors } from "../../ducks/form";

import sendBrevSchema from "./sendBrevSchema";
import "./sendBrev.css";

const mapStateToProps = (state: RootState) => ({
  formIsValid: formSelectors.SendBrevValidSelector(state),
  formValues: getFormValues(KV.Form.SEND_BREV)(state),
  initialValues: {
    felt: {},
  },
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  brukersNavn: behandlingerSelectors.SammensattNavnSelector(state),
  fnr: behandlingerSelectors.FnrSelector(state),
  orgnrValid: formSelectors.SendBrevOrgnummerValidSelector(state),
  virksomheter: behandlingerSelectors.AlleVirksomheterSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  changeField: (field: string, data: any) => dispatch(change(KV.Form.SEND_BREV, field, data)),
  hentOrganisasjon: (orgnr: string) => dispatch(OrganisasjonOperations.hent(orgnr)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  redigerbart: boolean;
  formValues: {
    valgtMal?: Api.Brev.TilgjengeligeMalerResDto;
    type?: string;
    mottaker?: string;
    organisasjonsnummer?: string;
    personInfo?: string;
    arbeidsgiver?: string;
    felt?: {
      [key: string]: any;
    };
  };
}

const SendBrev = ({
  brukersNavn,
  changeField,
  fnr,
  formValues,
  formIsValid,
  hentOrganisasjon,
  orgnrValid,
  redigerbart,
  saksnummer,
  virksomheter,
}: Props & PropsFromRedux) => {
  const [tilgjengeligeMaler, setTilgjengeligeMaler] = useState<Api.Brev.TilgjengeligeMalerResDto[]>();
  const [fullmektige, setFullmektige] = useState<Api.Fagsaker.aktoer.HentResDto>();
  const [mottakerFeil, setMottakerFeil] = useState<string>();
  const [adresse, setAdresse] = useState<
    | {
        orgnr?: string;
        navn?: string;
        kontaktperson?: string;
        brukerAdresse?: Ustrukturert;
        organisasjonsAdresse?: Organisasjon;
      }
    | undefined
  >();
  const arbeidsgiverHjelptekst =
    "Hvis arbeidsgiveren du ønsker å sende brev til ikke vises her, må du legge til denne i sidemenyen under «Arbeidsgiver/virksomhet». Det samme gjelder hvis du skal legge til kontaktopplysninger. \nHvis arbeidsgiveren ikke er en nåværende arbeidsgiver, kan du velge «Annen organisasjon» som mottaker og legge den til manuelt.";

  useEffect(() => {
    Api.Brev.hentTilgjengeligeMaler().then(setTilgjengeligeMaler).catch(Utils.logger.error);
    Api.Fagsaker.aktoer
      .hent(saksnummer, MKV.Koder.aktoersroller.REPRESENTANT)
      .then(setFullmektige)
      .catch(Utils.logger.error);
  }, []);

  useEffect(() => {
    const valgtMal = tilgjengeligeMaler?.find((mal) => mal.type.kode === formValues.type);
    changeField("valgtMal", valgtMal);
    if (valgtMal?.muligeMottakere.length === 1) {
      changeField("mottaker", JSON.stringify(valgtMal?.muligeMottakere[0]));
    }
  }, [formValues?.type]);

  const hentOrganisasjonIfValid = async (orgnr: string, valid: boolean) => {
    if (!valid) return undefined;
    const response = await hentOrganisasjon(orgnr);
    if (response.data.response) {
      setMottakerFeil(
        response.data.response.status === 404 ? "Kunne ikke finne organisasjon" : "Feil ved henting av organisasjon"
      );
      return undefined;
    }
    return response.data;
  };
  const debouncedHentOrganisasjon = useCallback(
    Utils._debounce(
      (data: { orgnr: string; valid: boolean }) =>
        hentOrganisasjonIfValid(data.orgnr, data.valid).then((org) => setAdresse({ organisasjonsAdresse: org })),
      1000
    ),
    []
  );

  const hentAdresseForBruker = async () => {
    const fullmektig =
      fullmektige &&
      fullmektige.find((aktoer) =>
        [MKV.Koder.representerer.BEGGE, MKV.Koder.representerer.BRUKER].includes(aktoer.representererKode)
      );
    if (fullmektig) {
      const kontaktinfo = await finnKontaktopplysninger(saksnummer, fullmektig.orgnr || "");
      const orgnr = kontaktinfo.kontaktorgnr || fullmektig.orgnr || "";
      const organisasjon = await hentOrganisasjonIfValid(orgnr, !Utils._isEmpty(orgnr));
      setAdresse({
        orgnr: fullmektig.orgnr || "",
        navn: Utils.streng.storeForbokstaver(organisasjon.navn),
        kontaktperson: kontaktinfo.kontaktnavn
          ? `Att. ${Utils.streng.storeForbokstaver(kontaktinfo.kontaktnavn)}`
          : undefined,
        organisasjonsAdresse: organisasjon,
      });
    } else {
      Api.Personer.hentGjeldendeAdresse(fnr)
        .then((response) => {
          if (response?.adresselinjer?.length > 0) {
            setAdresse({ navn: Utils.streng.storeForbokstaver(brukersNavn), brukerAdresse: response });
          } else {
            setMottakerFeil("Bruker har ingen registrert adresse.");
          }
        })
        .catch(Utils.logger.error);
    }
  };

  useEffect(() => {
    setAdresse(undefined);
    setMottakerFeil(undefined);
    if (!formValues || !formValues.mottaker) return;
    if (JSON.parse(formValues.mottaker).rolle === "BRUKER") {
      hentAdresseForBruker();
    }
    if (JSON.parse(formValues.mottaker).rolle === "ARBEIDSGIVER" && JSON.parse(formValues.mottaker).frittValg) {
      debouncedHentOrganisasjon({ orgnr: formValues.organisasjonsnummer, valid: orgnrValid });
    }
  }, [formValues?.mottaker, formValues?.organisasjonsnummer, orgnrValid]);

  const hentAdresseForArbeidsgiver = async () => {
    const fullmektig =
      fullmektige &&
      fullmektige.find((aktoer) =>
        [MKV.Koder.representerer.BEGGE, MKV.Koder.representerer.ARBEIDSGIVER].includes(aktoer.representererKode)
      );
    const kontaktinfo = await finnKontaktopplysninger(
      saksnummer,
      (fullmektig ? fullmektig.orgnr : formValues?.arbeidsgiver) || ""
    );
    const orgnr = kontaktinfo.kontaktorgnr || (fullmektig ? fullmektig.orgnr : formValues.arbeidsgiver) || "";
    const organisasjon = await hentOrganisasjonIfValid(orgnr, !Utils._isEmpty(orgnr));
    setAdresse({
      orgnr: (fullmektig ? fullmektig.orgnr : formValues?.arbeidsgiver) || "",
      navn: Utils.streng.storeForbokstaver(organisasjon.navn),
      kontaktperson: kontaktinfo.kontaktnavn
        ? `Att. ${Utils.streng.storeForbokstaver(kontaktinfo.kontaktnavn)}`
        : undefined,
      organisasjonsAdresse: organisasjon,
    });
  };

  useEffect(() => {
    setAdresse(undefined);
    if (formValues?.arbeidsgiver) {
      hentAdresseForArbeidsgiver();
    }
  }, [formValues?.arbeidsgiver]);

  if (!tilgjengeligeMaler || !formValues) return null;

  return (
    <div className="send_brev">
      <Skjema.Select
        feltNavn="type"
        label={<Nav.typo.Element>Type brev</Nav.typo.Element>}
        disabled={!redigerbart}
        emptyFieldText="Velg..."
        emptyFieldDisabled={!!formValues.type}
      >
        {tilgjengeligeMaler.map((mal) => (
          <option key={mal.type.kode} value={mal.type.kode}>
            {mal.type.term}
          </option>
        ))}
      </Skjema.Select>

      {!!formValues.type && !!formValues.valgtMal && (
        <Skjema.Select
          feltNavn="mottaker"
          label={
            <Nav.typo.Element>
              Mottaker
              {formValues.valgtMal.mottakereHjelpetekst && (
                <Nav.Hjelpetekst
                  className="hjelpetekst"
                  tittel={formValues.valgtMal.mottakereHjelpetekst}
                  type={Nav.PopoverOrientering.Venstre}
                >
                  {formValues.valgtMal.mottakereHjelpetekst}
                </Nav.Hjelpetekst>
              )}
            </Nav.typo.Element>
          }
          disabled={!redigerbart || formValues.valgtMal?.muligeMottakere.length === 1}
          emptyFieldText="Velg..."
          emptyFieldDisabled={!!formValues.mottaker}
        >
          {formValues.valgtMal?.muligeMottakere.map((mottaker) => (
            <option key={JSON.stringify(mottaker)} value={JSON.stringify(mottaker)}>
              {mottaker.type}
            </option>
          ))}
        </Skjema.Select>
      )}

      {mottakerFeil && <AlertStripeFeil>{mottakerFeil}</AlertStripeFeil>}

      {!!formValues.mottaker && JSON.parse(formValues.mottaker).rolle === "BRUKER" && (
        <Nav.Row>
          <Nav.Column xs="6">
            {adresse?.navn && <Nav.typo.Element>{adresse.navn}</Nav.typo.Element>}
            {adresse?.kontaktperson && <Nav.typo.Normaltekst>{adresse.kontaktperson}</Nav.typo.Normaltekst>}
            {adresse?.brukerAdresse && (
              <Fragment>
                <UstrukturertAdresse adresse={adresse.brukerAdresse} className="brukeradresse" />
              </Fragment>
            )}
            {adresse?.organisasjonsAdresse && (
              <OrganisasjonsAdresse organisasjon={adresse.organisasjonsAdresse} visNavn={false} visTittel={false} />
            )}
          </Nav.Column>
        </Nav.Row>
      )}

      {!!formValues.mottaker &&
        JSON.parse(formValues.mottaker).rolle === "ARBEIDSGIVER" &&
        !JSON.parse(formValues.mottaker).frittValg && (
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.typo.Normaltekst style={{ marginBottom: "0.5rem" }}>
                Velg:
                <Nav.Hjelpetekst
                  className="hjelpetekst"
                  tittel={arbeidsgiverHjelptekst}
                  type={Nav.PopoverOrientering.Venstre}
                >
                  {arbeidsgiverHjelptekst.split("\n").map((paragraf) => (
                    <p key={Utils._uuid()}>{paragraf}</p>
                  ))}
                </Nav.Hjelpetekst>
              </Nav.typo.Normaltekst>
              {virksomheter.map((virksomhet: KTObject) => (
                <Fragment>
                  <Skjema.Radio
                    className="arbeidsgiver_radio"
                    feltNavn="arbeidsgiver"
                    label={`${virksomhet.term} (org.nr. ${virksomhet.kode})`}
                    id={`arbeidsgiver.${virksomhet.kode}`}
                    key={`arbeidsgiver.${virksomhet.kode}`}
                    value={virksomhet.kode}
                    disabled={!redigerbart}
                  />
                  {formValues.arbeidsgiver === virksomhet.kode && (
                    <div className="arbeidsgiveradresse">
                      {adresse?.navn && <Nav.typo.Element>{adresse.navn}</Nav.typo.Element>}
                      {adresse?.kontaktperson && <Nav.typo.Normaltekst>{adresse.kontaktperson}</Nav.typo.Normaltekst>}
                      {adresse?.organisasjonsAdresse && (
                        <OrganisasjonsAdresse
                          organisasjon={adresse.organisasjonsAdresse}
                          visNavn={false}
                          visTittel={false}
                        />
                      )}
                    </div>
                  )}
                </Fragment>
              ))}
            </Nav.Column>
          </Nav.Row>
        )}

      {!!formValues.mottaker &&
        JSON.parse(formValues.mottaker).rolle === "ARBEIDSGIVER" &&
        JSON.parse(formValues.mottaker).frittValg && (
          <Nav.Row>
            <Nav.Column xs="6">
              <Skjema.Input
                feltNavn="organisasjonsnummer"
                label="Organisasjonsnummer"
                placeholder="Skriv inn"
                disabled={!redigerbart}
              />
              {adresse?.organisasjonsAdresse && (
                <OrganisasjonsAdresse organisasjon={adresse.organisasjonsAdresse} visNavn boldNavn visTittel={false} />
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
          </Nav.Row>
        )}

      {!!formValues.mottaker &&
        formValues?.valgtMal?.felter?.length &&
        formValues.valgtMal.felter.length > 0 &&
        formValues.valgtMal.felter.map((felt) => {
          if (felt.valg?.length && felt.valg.length > 0) {
            return (
              <Fragment key="radioknapper">
                <Nav.typo.Element className="fritekst_label">
                  {felt.beskrivelse}
                  {felt.hjelpetekst && (
                    <Nav.Hjelpetekst
                      className="hjelpetekst"
                      tittel={felt.hjelpetekst}
                      type={Nav.PopoverOrientering.Venstre}
                    >
                      {felt.hjelpetekst}
                    </Nav.Hjelpetekst>
                  )}
                </Nav.typo.Element>
                {felt.valg.map((valg) => (
                  <Skjema.Radio
                    feltNavn={`felt.${felt.kode}.valg`}
                    label={valg.beskrivelse}
                    id={`${felt.kode}.${valg.kode}`}
                    key={`${felt.kode}.${valg.kode}`}
                    value={valg.kode}
                    disabled={!redigerbart}
                  />
                ))}
                {formValues.felt && formValues.felt[felt.kode]?.valg === "FRITEKST" && felt.feltType === "FRITEKST" && (
                  <Skjema.HTMLEditor feltNavn={`felt.${felt.kode}.fritekst`} />
                )}
              </Fragment>
            );
          } else if (felt.feltType === "FRITEKST") {
            return (
              <Fragment key="fritekst">
                <Nav.typo.Element className="fritekst_label">
                  {felt.beskrivelse}
                  {felt.hjelpetekst && (
                    <Nav.Hjelpetekst
                      className="hjelpetekst"
                      tittel={felt.hjelpetekst}
                      type={Nav.PopoverOrientering.Venstre}
                    >
                      {felt.hjelpetekst}
                    </Nav.Hjelpetekst>
                  )}
                </Nav.typo.Element>
                <Skjema.HTMLEditor feltNavn={`felt.${felt.kode}.fritekst`} />
              </Fragment>
            );
          }
          return <></>;
        })}

      <div>
        <Nav.Hovedknapp
          mini
          disabled={!redigerbart || !formIsValid}
          className="brevknapp"
          onClick={() => console.log("Send brev")}
        >
          Send brev
        </Nav.Hovedknapp>
        <Nav.Knapp mini disabled={false} className="brevknapp" onClick={() => console.log("Forkast brev")}>
          Forkast brev
        </Nav.Knapp>
      </div>
    </div>
  );
};

const SendBrevForm = reduxForm<{}, Props & PropsFromRedux>({
  form: KV.Form.SEND_BREV,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(sendBrevSchema),
})(SendBrev);

export default connector(SendBrevForm);
