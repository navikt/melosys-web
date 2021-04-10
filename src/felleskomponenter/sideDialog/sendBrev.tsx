import React, { Fragment, useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { change, getFormValues, reduxForm, reset } from "redux-form";
import { Organisasjon } from "Domene";
import { AlertStripeFeil } from "nav-frontend-alertstriper";

import * as Api from "../../services/api";
import * as KV from "../../kodeverk";
import * as Ikoner from "../../resources/images";
import * as Nav from "../../utils/navFrontend";
import * as Skjema from "../skjema";
import * as Utils from "../../utils";

import { OrganisasjonOperations } from "../../ducks/organisasjoner";
import { OrganisasjonsAdresse } from "../adresser";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { lagYupToReduxformErrorMapper } from "../../yup";
import { formSelectors } from "../../ducks/form";
import PdfLenkeListe from "../pdfLenkeListe";
import MottakerTabell from "../tabell/mottakerTabell";

import sendBrevSchema from "./sendBrevSchema";
import "./sendBrev.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formIsValid: formSelectors.SendBrevValidSelector(state),
  formValues: getFormValues(KV.Form.SEND_BREV)(state),
  initialValues: {
    felt: {},
  },
  orgnrValid: formSelectors.SendBrevOrgnummerValidSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  changeField: (field: string, data: any) => dispatch(change(KV.Form.SEND_BREV, field, data)),
  hentOrganisasjon: (orgnr: string) => dispatch(OrganisasjonOperations.hent(orgnr)),
  resetForm: () => reset(KV.Form.SEND_BREV),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  redigerbart: boolean;
  formValues: {
    valgtMal?: Api.DokumenterV2.TilgjengeligeMaler;
    type?: string;
    mottaker?: string;
    organisasjonsnummer?: string;
    kontaktperson?: string;
    arbeidsgiver?: string;
    felt?: {
      [key: string]: any;
    };
  };
}

const SendBrev = ({
  behandlingID,
  changeField,
  formValues,
  formIsValid,
  hentOrganisasjon,
  orgnrValid,
  redigerbart,
  resetForm,
}: Props & PropsFromRedux) => {
  const [tilgjengeligeMaler, setTilgjengeligeMaler] = useState<Api.DokumenterV2.TilgjengeligeMalerResDto>();
  const [mottakerFeil, setMottakerFeil] = useState<string>();
  const [adresse, setAdresse] = useState<{
    mottakerAdresse?: Api.DokumenterV2.MottakerAdresse;
    organisasjonsAdresse?: Organisasjon;
  }>();
  const [muligeMottakere, setMuligeMottakere] = useState<Api.DokumenterV2.HentMuligeMottakereResDto>();
  const arbeidsgiverHjelptekst =
    "Hvis arbeidsgiveren du ønsker å sende brev til ikke vises her, må du legge til denne i sidemenyen under «Arbeidsgiver/virksomhet». Det samme gjelder hvis du skal legge til kontaktopplysninger. \nHvis arbeidsgiveren ikke er en nåværende arbeidsgiver, kan du velge «Annen organisasjon» som mottaker og legge den til manuelt.";

  useEffect(() => {
    Api.DokumenterV2.hentTilgjengeligeMaler(behandlingID).then(setTilgjengeligeMaler).catch(Utils.logger.error);
  }, []);

  useEffect(() => {
    const valgtMal = tilgjengeligeMaler?.find((mal) => mal.type.kode === formValues.type);
    changeField("valgtMal", valgtMal);
    changeField("mottaker", undefined);
    if (valgtMal?.muligeMottakere.length === 1) {
      changeField("mottaker", JSON.stringify(valgtMal?.muligeMottakere[0]));
    }
  }, [formValues?.type]);

  const hentMuligeMottakere = (valgtMal: string, orgnr: string | undefined) => {
    Api.DokumenterV2.hentMuligeMottakere(behandlingID, { produserbartdokument: valgtMal, orgnr: orgnr || null })
      .then(setMuligeMottakere)
      .catch(Utils.logger.error);
  };

  const hentOrganisasjonIfValid = async (data: { orgnr: string; valid: boolean }) => {
    if (!data.valid) return;
    const response = await hentOrganisasjon(data.orgnr);
    if (response.data.response) {
      setMottakerFeil(
        response.data.response.status === 404 ? "Kunne ikke finne organisasjon" : "Feil ved henting av organisasjon"
      );
    } else {
      setAdresse({ organisasjonsAdresse: response.data });
      if (formValues?.type) hentMuligeMottakere(formValues.type, data.orgnr);
    }
  };
  const debouncedHentOrganisasjon = useCallback(Utils._debounce(hentOrganisasjonIfValid, 500), []);

  useEffect(() => {
    setAdresse(undefined);
    setMottakerFeil(undefined);
    setMuligeMottakere(undefined);
    if (!formValues || !formValues.mottaker || !formValues.type) return;
    const mottaker = JSON.parse(formValues.mottaker);
    if (mottaker.rolle === "BRUKER") {
      if (mottaker.feilmelding) setMottakerFeil(mottaker.feilmelding);
      else {
        setAdresse({ mottakerAdresse: mottaker?.adresser[0] });
        hentMuligeMottakere(formValues.type, undefined);
      }
    }
    if (mottaker.rolle === "ARBEIDSGIVER" && mottaker.orgnrSettesAvSaksbehandler) {
      debouncedHentOrganisasjon({ orgnr: formValues.organisasjonsnummer, valid: orgnrValid });
    }
    if (mottaker.rolle === "ARBEIDSGIVER" && !mottaker.orgnrSettesAvSaksbehandler) {
      if (mottaker.feilmelding) setMottakerFeil(mottaker.feilmelding);
    }
  }, [formValues?.mottaker, formValues?.organisasjonsnummer, orgnrValid]);

  useEffect(() => {
    setAdresse(undefined);
    setMuligeMottakere(undefined);
    if (formValues?.arbeidsgiver && formValues?.mottaker && formValues?.type) {
      setAdresse({
        mottakerAdresse: JSON.parse(formValues.mottaker).adresser.find(
          (mottakerAdresse: Api.DokumenterV2.MottakerAdresse) =>
            mottakerAdresse.tittel.orgnr === formValues.arbeidsgiver
        ),
      });
      hentMuligeMottakere(formValues.type, formValues.arbeidsgiver);
    }
  }, [formValues?.arbeidsgiver]);

  const sendBrev = () => {
    const mottaker = formValues.mottaker && JSON.parse(formValues.mottaker);
    let requestBody: Api.DokumenterV2.OpprettBrevReqDto = {
      produserbardokument: formValues.type || "",
      mottaker: mottaker.rolle,
      innledningFritekst:
        (formValues?.felt?.INNLEDNING_FRITEKST?.valg === "FRITEKST" && formValues.felt.INNLEDNING_FRITEKST?.fritekst) ||
        null,
      manglerFritekst: formValues?.felt?.MANGLER_FRITEKST?.fritekst || null,
      kopiMottakere:
        muligeMottakere?.kopiMottakere.map((kopiMottaker) => ({
          rolle: kopiMottaker.rolle,
          aktørId: kopiMottaker.aktørId,
          orgnr: kopiMottaker.orgnr,
        })) || [],
    };
    if (mottaker.rolle === "ARBEIDSGIVER") {
      requestBody = {
        ...requestBody,
        orgNr: mottaker.orgnrSettesAvSaksbehandler ? formValues.organisasjonsnummer : formValues.arbeidsgiver,
        kontaktperson: mottaker.orgnrSettesAvSaksbehandler ? formValues.kontaktperson : null,
      };
    }
    Api.DokumenterV2.opprettBrev(behandlingID, requestBody).catch(Utils.logger.error);
  };

  const slettKopiMottaker = (kopiMottaker: Api.DokumenterV2.MuligMottaker) => {
    if (!muligeMottakere) return;
    setMuligeMottakere({
      ...muligeMottakere,
      kopiMottakere: muligeMottakere.kopiMottakere.filter((mottaker) => mottaker !== kopiMottaker),
    });
  };

  const lagDokumenterData = (mottaker: Api.DokumenterV2.MuligMottaker, ikon?: boolean) => {
    return [
      {
        sendesTilDokumenterV2: true,
        navn: ikon ? <Ikoner.Forhandsvis /> : mottaker.dokumentNavn,
        data: {
          produserbardokument: formValues.type,
          mottaker: mottaker.rolle,
          innledningFritekst:
            (formValues?.felt?.INNLEDNING_FRITEKST?.valg === "FRITEKST" &&
              formValues.felt.INNLEDNING_FRITEKST?.fritekst) ||
            null,
          manglerFritekst: formValues?.felt?.MANGLER_FRITEKST?.fritekst || null,
          kopiMottakere: [],
        },
      },
    ];
  };

  const mapRad = (mottaker: Api.DokumenterV2.MuligMottaker, kanSlettes: boolean) => {
    return [
      {
        verdi: (
          <PdfLenkeListe
            behandlingID={behandlingID}
            dokumenter={lagDokumenterData(mottaker)}
            vedKlikk={() => formIsValid}
            className="forhåndsvisning"
          />
        ),
      },
      { verdi: mottaker.mottakerNavn },
      {
        verdi: (
          <PdfLenkeListe
            behandlingID={behandlingID}
            dokumenter={lagDokumenterData(mottaker, true)}
            vedKlikk={() => formIsValid}
            className="forhåndsvisning"
          />
        ),
        style: "midtstilt",
      },
      { verdi: kanSlettes ? <Ikoner.Bin onClick={() => slettKopiMottaker(mottaker)} /> : <></>, style: "slettKnapp" },
    ];
  };

  const mapMottakerRader = (mottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return [
      mapRad(mottakere.hovedMottaker, false),
      ...mottakere.kopiMottakere.map((mottaker) => mapRad(mottaker, true)),
      ...mottakere.fasteMottakere.map((mottaker) => mapRad(mottaker, false)),
    ];
  };

  const MottakerAdresseComponent = ({
    tittel,
    adresselinjer,
    postnr,
    poststed,
    land,
    className,
  }: Api.DokumenterV2.MottakerAdresse & { className: string }) => {
    return (
      <div className={className}>
        <div>
          <b>{tittel.mottakerNavn}</b>
        </div>
        {adresselinjer.map((linje) => (
          <div key={Utils._uuid()}>{linje}</div>
        ))}
        <div>
          {postnr} {poststed}
        </div>
        <div>{land}</div>
      </div>
    );
  };

  const mottakerErValgt = formValues?.mottaker;
  const mottakerErBruker = formValues?.mottaker && JSON.parse(formValues.mottaker).rolle === "BRUKER";
  const mottakerErArbeidsgiver =
    formValues?.mottaker &&
    JSON.parse(formValues.mottaker).rolle === "ARBEIDSGIVER" &&
    !JSON.parse(formValues.mottaker).orgnrSettesAvSaksbehandler;
  const mottakerOrgNrSettesAvSaksbehandler =
    formValues?.mottaker &&
    JSON.parse(formValues.mottaker).rolle === "ARBEIDSGIVER" &&
    JSON.parse(formValues.mottaker).orgnrSettesAvSaksbehandler;

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
            <Nav.typo.Element tag="div">
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

      {mottakerErBruker && (
        <Nav.Row>
          <Nav.Column xs="12">
            {mottakerFeil && <AlertStripeFeil>{mottakerFeil}</AlertStripeFeil>}
            {adresse?.mottakerAdresse && (
              <MottakerAdresseComponent {...adresse?.mottakerAdresse} className="brukeradresse" />
            )}
          </Nav.Column>
        </Nav.Row>
      )}

      {mottakerErArbeidsgiver && (
        <Nav.Row>
          {mottakerFeil ? (
            <AlertStripeFeil>{mottakerFeil}</AlertStripeFeil>
          ) : (
            <Nav.Column xs="12">
              <Nav.typo.Normaltekst style={{ marginBottom: "0.5rem" }} tag="div">
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
              {formValues?.mottaker &&
                JSON.parse(formValues.mottaker)?.adresser?.map((virksomhet: Api.DokumenterV2.MottakerAdresse) => (
                  <Fragment key={Utils._uuid()}>
                    <Skjema.Radio
                      className="arbeidsgiver_radio"
                      feltNavn="arbeidsgiver"
                      label={`${virksomhet.tittel.mottakerNavn} (org.nr. ${virksomhet.tittel.orgnr})`}
                      id={`arbeidsgiver.${virksomhet.tittel.orgnr}`}
                      key={`arbeidsgiver.${virksomhet.tittel.orgnr}`}
                      value={virksomhet.tittel.orgnr}
                      disabled={!redigerbart}
                    />
                    {formValues.arbeidsgiver === virksomhet.tittel.orgnr && adresse?.mottakerAdresse && (
                      <MottakerAdresseComponent {...adresse?.mottakerAdresse} className="arbeidsgiveradresse" />
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
          {mottakerFeil && <AlertStripeFeil>{mottakerFeil}</AlertStripeFeil>}
        </Nav.Row>
      )}

      {mottakerErValgt &&
        formValues?.valgtMal?.felter &&
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

      {mottakerErValgt && (
        <MottakerTabell
          rader={muligeMottakere && formIsValid ? mapMottakerRader(muligeMottakere) : []}
          kolonner={[
            { verdi: "Dokumenter", bredde: "44%" },
            { verdi: "Mottaker", bredde: "40%" },
            { verdi: "Forhåndsvis", bredde: "8%", style: "normal_font_weight midtstilt" },
            { verdi: "Slett", bredde: "8%", style: "normal_font_weight midtstilt" },
          ]}
        />
      )}

      <div>
        <Nav.Hovedknapp
          mini
          disabled={!redigerbart || !formIsValid || !!mottakerFeil}
          className="brevknapp"
          onClick={sendBrev}
        >
          Send brev
        </Nav.Hovedknapp>
        <Nav.Knapp mini disabled={false} className="brevknapp" onClick={resetForm}>
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
