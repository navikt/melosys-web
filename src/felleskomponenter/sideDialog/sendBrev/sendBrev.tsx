/* eslint-disable max-lines */
import { FocusEvent, useEffect, useRef, useState } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { change, getFormValues, reduxForm, reset } from "redux-form";
import { ColumnWidth } from "nav-frontend-grid";

import { useMsal } from "@azure/msal-react";
import { URL_BASENAME } from "../../../constants";

import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Ikoner from "../../../resources/images";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../skjema";
import * as Utils from "../../../utils";
import { FysiskDokument, BrevVedleggInterface } from "../../../services/modules/dokumenter-v2";

import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { behandlingerOperations } from "../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { formSelectors } from "../../../ducks/form";

import BrevMottaker, { erAnnenOrganisasjon, erNorskMyndighet } from "./brevMottaker/brevMottaker";
import BrevMottakereTabell from "./brevMottaker/brevMottakereTabell";
import Brevutkast from "./brevutkast/brevutkast";
import BrevValg from "./brevValg";
import { SendBrevFormValues } from "./types";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import sendBrevSchema from "./sendBrevSchema";
import "./sendBrev.css";
import BrevVedlegg from "./brevVedlegg/brevVedlegg";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst";
import { visRelevanteFeil } from "./errorUtils";

const { VIRKSOMHET, ARBEIDSGIVER, ANNEN_ORGANISASJON, NORSK_MYNDIGHET, UTENLANDSK_TRYGDEMYNDIGHET } =
  MKV.Koder.mottakerroller;

const mapStateToProps = (state: RootState) => ({
  formIsValid: formSelectors.SendBrevValidSelector(state),
  formValues: getFormValues(KV.Form.SEND_BREV)(state),
  formErrors: state.form?.[KV.Form.SEND_BREV]?.syncErrors || {},
  initialValues: {
    felt: {},
  },
  soknadsland: mottatteOpplysningerSelectors.SoknadslandSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  changeField: (field: string, data: any) => dispatch(change(KV.Form.SEND_BREV, field, data)),
  resetForm: () => dispatch(reset(KV.Form.SEND_BREV)),
  oppdaterBehandling: () => dispatch(behandlingerOperations.oppdaterBehandling()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export interface Fritekstvedlegg {
  tittel: string;
  fritekst: string;
}

interface Props {
  redigerbart: boolean;
  visApneINyttVindu: boolean;
  behandlingID: number;
  brevTypeSelectWidth?: ColumnWidth;
  mottakerSelectWidth?: ColumnWidth;
  mottakerTabellWidth?: ColumnWidth;
  felterWidth?: ColumnWidth;
  formValues: SendBrevFormValues;
  dokumenter: FysiskDokument[];
  saksnummer: string;
}

function SendBrev({
  behandlingID,
  changeField,
  formValues,
  formIsValid,
  oppdaterBehandling,
  redigerbart,
  resetForm,
  formErrors,
  visApneINyttVindu,
  dokumenter,
  brevTypeSelectWidth = "12",
  mottakerSelectWidth = "12",
  mottakerTabellWidth = "12",
  felterWidth = "12",
  saksnummer,
  soknadsland,
  sakstype,
}: Props & PropsFromRedux) {
  const [tilgjengeligeMaler, setTilgjengeligeMaler] = useState<Api.DokumenterV2.TilgjengeligeMalerResDto>();
  const [standardvedleggListe, setStandardvedleggListe] = useState<Api.DokumenterV2.TilgjengeligStandardvedlegg[]>([]);
  const [muligeMottakere, setMuligeMottakere] = useState<Api.DokumenterV2.HentMuligeMottakereResDto>();
  const [muligeMottakereFeil, setMuligeMottakereFeil] = useState<string | undefined>(undefined);
  const [muligeMottakereNorskMyndighet, setMuligeMottakereNorskMyndighet] =
    useState<Api.DokumenterV2.MuligMottaker[]>();
  const [brevSendt, setBrevSendt] = useState(false);
  const [, setFeil] = useState<string | undefined>();
  const [visFeil, setvisFeil] = useState(false);
  const prevFormValues = useRef(formValues);
  const [valgteVedlegg, setValgteVedlegg] = useState<BrevVedleggInterface>({
    saksvedlegg: [],
    standardvedlegg: null,
  });
  const [visFritekstvedleggSkjema, setVisFritekstvedleggSkjema] = useState(false);
  const [redigerFritekstVedleggIndex, setRedigerFritekstvedleggIndex] = useState<number | undefined>(undefined);
  const [fritekstvedlegg, setFritekstvedlegg] = useState<Fritekstvedlegg[]>([]);
  const [utkastPåBehandlingen, setUtkastPåBehandlingen] = useState<Api.Brevutkast.BrevutkastResDto[]>([]);
  const [sendBrevSpinner, setSendBrevSpinner] = useState(false);
  const [lagreUtkastSpinner, setLagreUtkastSpinner] = useState(false);
  const [forkastBrevSpinner, setForkastBrevSpinner] = useState(false);
  const tilgjengeligeMottakere = tilgjengeligeMaler?.map((mal) => mal.mottaker) || [];
  const tilgjengeligeBrevtyper =
    tilgjengeligeMaler?.find((mal) => mal?.mottaker.uuid === formValues?.mottaker)?.brevTyper || [];
  const mottakerErNorskMyndighet = erNorskMyndighet(formValues?.valgtMottaker?.rolle);
  const mottakerErArbeidsgiver = formValues?.valgtMottaker?.rolle === ARBEIDSGIVER;
  const { accounts } = useMsal();

  const valgtMottakerHarFeilmelding = formValues?.valgtMottaker?.feilmelding;

  const hentUtkast = () =>
    Api.Brevutkast.hentBrevutkast(behandlingID).then((response) => setUtkastPåBehandlingen(response));

  const hentTilgjengeligeMaler = () =>
    Api.DokumenterV2.hentTilgjengeligeMaler(behandlingID).then((response) => {
      response.forEach((mal) => {
        /* eslint-disable no-param-reassign */
        mal.mottaker.uuid = Utils._uuid();
        /* eslint-enable no-param-reassign */
      });
      setTilgjengeligeMaler(response);
    });

  const hentTilgjengeligeStandardvedlegg = () =>
    Api.DokumenterV2.hentTilgjengeligeStandardvedlegg().then((response) => setStandardvedleggListe(response));

  const krevesLandForUtenlandskTrygdemyndighetMottaker = () => {
    return Boolean(
      tilgjengeligeBrevtyper.find((brevType) =>
        brevType?.felter?.find((felt) => felt.kode === "UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER"),
      ),
    );
  };
  const erUtenlandskTrygdemyndighetMottakerGyldig = (values: SendBrevFormValues) => {
    if (krevesLandForUtenlandskTrygdemyndighetMottaker()) {
      return !!values?.felt?.UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER?.valg;
    }
    return true;
  };

  const erMottakerGyldig = (values: SendBrevFormValues) => {
    if (!values?.valgtMottaker?.rolle) return false;
    switch (values.valgtMottaker.rolle) {
      case ARBEIDSGIVER:
        return Boolean(values.arbeidsgiver);
      case ANNEN_ORGANISASJON:
        return Boolean(values.organisasjonsnummer);
      case NORSK_MYNDIGHET:
        return !Utils._isEmpty(values.norskeMyndigheter);
      case UTENLANDSK_TRYGDEMYNDIGHET:
        return erUtenlandskTrygdemyndighetMottakerGyldig(values);
      default:
        return true;
    }
  };

  const kanHenteMuligeMottakere = (values: SendBrevFormValues) => {
    if (!values || !values.valgtMottaker || !values.type || values.valgtMottaker?.feilmelding) return false;
    return erMottakerGyldig(values);
  };

  const hentMuligeMottakere = () => {
    setMuligeMottakereNorskMyndighet(undefined);
    setMuligeMottakere(undefined);
    if (mottakerErNorskMyndighet) {
      Api.DokumenterV2.hentMuligeMottakereNorskMyndighet(behandlingID, {
        produserbartdokument: formValues?.type || "",
        orgnrNorskMyndighet: formValues.norskeMyndigheter || [],
      })
        .then((response) => setMuligeMottakereNorskMyndighet(response))
        .catch((e) => setMuligeMottakereFeil(e?.body?.message));
    } else {
      Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
        produserbartdokument: formValues?.type || "",
        orgnr: formValues.organisasjonsnummer || formValues.arbeidsgiver || null,
        institusjonID: hentFormVerdi("UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER", true, true),
      })
        .then((response) => setMuligeMottakere(response))
        .catch((e) => setMuligeMottakereFeil(e?.body?.message));
    }
  };

  useEffect(() => {
    hentTilgjengeligeMaler();
    hentTilgjengeligeStandardvedlegg();
    hentUtkast();
  }, []);

  useEffect(() => {
    if (
      tilgjengeligeBrevtyper?.length === 1 &&
      (krevesLandForUtenlandskTrygdemyndighetMottaker() || erMottakerGyldig(formValues) || mottakerErNorskMyndighet)
    ) {
      changeField("type", tilgjengeligeBrevtyper[0].type.kode);
    } else if (tilgjengeligeBrevtyper?.length === 1 && !erMottakerGyldig(formValues)) {
      changeField("type", undefined);
    }
  }, [
    tilgjengeligeBrevtyper,
    formValues?.valgtMottaker,
    formValues?.organisasjonsnummer,
    formValues?.arbeidsgiver,
    formValues?.norskeMyndigheter,
  ]);

  useEffect(() => {
    if (tilgjengeligeBrevtyper?.length > 1 && formValues?.type) {
      changeField("type", undefined);
    }
  }, [formValues?.valgtMottaker]);

  useEffect(() => {
    changeField(
      "valgtBrev",
      tilgjengeligeBrevtyper.find((brevType) => brevType.type.kode === formValues.type),
    );
  }, [formValues?.type]);

  useEffect(() => {
    setMuligeMottakereFeil(undefined);
    if (kanHenteMuligeMottakere(formValues)) {
      hentMuligeMottakere();
    }
  }, [
    formValues?.valgtBrev,
    formValues?.organisasjonsnummer,
    formValues?.arbeidsgiver,
    formValues?.norskeMyndigheter,
    formValues?.felt?.UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER,
  ]);

  useEffect(() => {
    if (sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE) {
      setTimeout(() => {
        if (valgtMottakerHarFeilmelding) {
          hentTilgjengeligeMaler();
          resetForm();
        } else if (kanHenteMuligeMottakere(formValues)) {
          hentMuligeMottakere();
        }
      }, 500);
    }
  }, [soknadsland]);

  const visInnhold = Boolean(tilgjengeligeMaler && formValues);

  useEffect(() => {
    if (visInnhold) {
      Utils.navigasjon.flyttFokusTilHtmlElementFraId("brevbestilling");
    }
  }, [visInnhold]);

  useEffect(() => {
    if (brevSendt && formValues?.mottaker) {
      setBrevSendt(false);
    }
  }, [formValues?.mottaker]);

  const finnValgAlternativ = (felt: Api.DokumenterV2.Felt) => {
    return felt?.valg?.valgAlternativer.find((alternativ) => alternativ.kode === formValues?.felt?.[felt.kode]?.valg);
  };

  const erFritekstBrev = () =>
    [
      MKV.Koder.brev.produserbaredokumenter.GENERELT_FRITEKSTBREV_BRUKER,
      MKV.Koder.brev.produserbaredokumenter.GENERELT_FRITEKSTBREV_ARBEIDSGIVER,
      MKV.Koder.brev.produserbaredokumenter.GENERELT_FRITEKSTBREV_VIRKSOMHET,
    ].includes(formValues.type);

  const finnSaksbehandlerIdentForDobbelSignatur = () => {
    if (!erFritekstBrev()) return null;

    const saksbehandler = accounts && accounts.length > 0 ? accounts[0] : null;
    return saksbehandler?.idTokenClaims?.NAVident !== formValues.aktivtUtkast?.lagretAvSaksbehandlerIdent
      ? formValues.aktivtUtkast?.lagretAvSaksbehandlerIdent
      : null;
  };

  const hentFormVerdi = (feltNavn: string, hentValgverdi: boolean = false, hentKode: boolean = false): any => {
    const feltFraValgtMal = formValues?.valgtBrev?.felter?.find((felt) => felt.kode === feltNavn);
    if (!feltFraValgtMal) {
      return null;
    }
    const feltVerdi = formValues.felt?.[feltNavn]?.feltVerdi;

    if (feltFraValgtMal?.valg) {
      const valgtAlternativ = finnValgAlternativ(feltFraValgtMal);
      if (!hentValgverdi) {
        return valgtAlternativ?.visFelt ? feltVerdi : null;
      }

      if (hentKode) {
        return valgtAlternativ?.kode;
      }

      return valgtAlternativ?.visFelt ? feltVerdi : valgtAlternativ?.beskrivelse;
    }
    return feltVerdi;
  };

  const hentKopiMottakere = () => {
    return formValues.kopiTilBruker
      ? muligeMottakere?.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker)
      : [];
  };

  const hentOrgnr = (mottakerRolle: string) => {
    switch (mottakerRolle) {
      case VIRKSOMHET:
      case ARBEIDSGIVER:
        return formValues.arbeidsgiver;
      case ANNEN_ORGANISASJON:
        return formValues.organisasjonsnummer;
      default:
        return null;
    }
  };

  const hentBrevRequest = (mottakerRolle: string): Api.DokumenterV2.OpprettBrevReqDto => ({
    produserbardokument: formValues.type || "",
    mottaker: mottakerRolle,
    orgNr: hentOrgnr(mottakerRolle),
    kontaktpersonNavn: erAnnenOrganisasjon(mottakerRolle) ? formValues.kontaktperson : null,
    orgnrNorskMyndighet: formValues.norskeMyndigheter,
    innledningFritekst: hentFormVerdi("INNLEDNING_FRITEKST"),
    manglerFritekst: hentFormVerdi("MANGLER_FRITEKST"),
    fritekstTittel: hentFormVerdi("BREV_TITTEL", true),
    fritekst: hentFormVerdi("FRITEKST"),
    skalViseStandardTekstOmOpplysninger: hentFormVerdi("STANDARDTEKST_INNTEKTSOPPLYSNINGER"),
    kopiMottakere: hentKopiMottakere() || [],
    skalViseStandardTekstOmkontaktopplysninger: hentFormVerdi("STANDARDTEKST_KONTAKTINFORMASJON"),
    saksvedlegg: valgteVedlegg?.saksvedlegg.map((vedlegg) => ({
      dokumentID: vedlegg.dokumentID,
      journalpostID: vedlegg.journalpostID,
    })),
    standardvedleggType: valgteVedlegg?.standardvedlegg?.type,
    fritekstvedlegg,
    distribusjonstype: hentFormVerdi("DISTRIBUSJONSTYPE", true, true),
    dokumentTittel: hentFormVerdi("DOKUMENT_TITTEL", true),
    saksbehandlerNrToIdent: finnSaksbehandlerIdentForDobbelSignatur(),
    institusjonID: hentFormVerdi("UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER", true, true),
  });

  useEffect(() => {
    const skjemaHarEndretSeg = JSON.stringify(prevFormValues.current) !== JSON.stringify(formValues);
    if (skjemaHarEndretSeg) {
      setvisFeil(false);
    }
    prevFormValues.current = formValues;
  }, [formValues]);

  const sendBrev = () => {
    setvisFeil(true);

    if (!formValues?.valgtMottaker) return;
    if (!formIsValid || (formErrors && Object.keys(formErrors).length)) return;

    setSendBrevSpinner(true);
    setFeil(undefined);

    Api.DokumenterV2.opprettBrev(behandlingID, hentBrevRequest(formValues.valgtMottaker.rolle))
      .then(() => {
        setBrevSendt(true);
        oppdaterBehandling();
        slettUtkast();
        resetFormOgFritekstvedleggState();
        setvisFeil(false);
      })
      .catch(() => setFeil("Brevet er ikke sendt. Det skjedde en feil."))
      .finally(() => setSendBrevSpinner(false));
  };

  const slettUtkast = async () => {
    if (formValues?.aktivtUtkast?.utkastBrevID) {
      await Api.Brevutkast.slettBrevutkast(behandlingID, formValues.aktivtUtkast.utkastBrevID)
        .then(() => {
          changeField("aktivtUtkast", null);
          hentUtkast();
        })
        .catch(() => setFeil("Utkastet er ikke slettet. Det skjedde en feil"));
    }
  };

  const forkastBrev = async () => {
    setForkastBrevSpinner(true);
    resetFormOgFritekstvedleggState();
    setvisFeil(false);
    setBrevSendt(false);
    setFeil(undefined);
    setMuligeMottakereFeil(undefined);
    await slettUtkast();
    setForkastBrevSpinner(false);
  };

  const resetFormOgFritekstvedleggState = () => {
    resetForm();
    setFritekstvedlegg([]);
    setVisFritekstvedleggSkjema(false);
    setRedigerFritekstvedleggIndex(undefined);
  };

  const lagreUtkast = () => {
    if (!formValues?.valgtMottaker) return;
    setLagreUtkastSpinner(true);
    setFeil(undefined);

    const requestData = hentBrevRequest(formValues.valgtMottaker.rolle);

    (formValues?.aktivtUtkast?.utkastBrevID
      ? Api.Brevutkast.oppdaterBrevutkast(behandlingID, formValues.aktivtUtkast.utkastBrevID, requestData)
      : Api.Brevutkast.lagreBrevutkast(behandlingID, requestData)
    )
      .then(() => {
        resetFormOgFritekstvedleggState();
        hentUtkast();
      })
      .catch(() => setFeil("Utkastet ble ikke lagret. Det skjedde en feil."))
      .finally(() => setLagreUtkastSpinner(false));
  };

  const overstyrBlurEvent = (event: FocusEvent) => {
    event.preventDefault();
  };

  const harStandardVedlegg = () => {
    return formValues?.valgtMottaker?.rolle === "BRUKER" && formValues?.felt?.DISTRIBUSJONSTYPE?.valg === "VEDTAK";
  };

  if (!tilgjengeligeMaler || !formValues) return null;
  if (!visInnhold) return null;

  const mottakerErValgt = formValues.valgtMottaker;
  const brevtypeErValgt = formValues.valgtBrev;

  const nyttvinduHref = `${URL_BASENAME}/sendbrev/${behandlingID}/${saksnummer}`;

  const spinnerAktiv = sendBrevSpinner || lagreUtkastSpinner || forkastBrevSpinner;

  const knappErDisabled =
    !redigerbart ||
    !formIsValid ||
    !!formValues.valgtMottaker?.feilmelding ||
    visFritekstvedleggSkjema ||
    Boolean(muligeMottakereFeil) ||
    spinnerAktiv;

  return (
    <div className="send_brev">
      <Brevutkast
        changeField={changeField}
        dokumenter={dokumenter}
        standardvedleggListe={standardvedleggListe}
        formValues={formValues}
        tilgjengeligeMottakere={tilgjengeligeMottakere}
        utkastPåBehandlingen={utkastPåBehandlingen}
        setFritekstvedlegg={setFritekstvedlegg}
        setValgteVedlegg={setValgteVedlegg}
      />

      {visApneINyttVindu && (
        <div className="send_brev__apne-nytt-vindu-container">
          <Nav.Link target="_blank" href={nyttvinduHref}>
            Åpne i nytt vindu
            <Ikoner.ExternalLink />
          </Nav.Link>
        </div>
      )}

      <Nav.Row className="brevmottaker__wrapper">
        <Nav.Column xs={mottakerSelectWidth}>
          <BrevMottaker
            redigerbart={redigerbart}
            tilgjengeligeMottakere={tilgjengeligeMottakere}
            overstyrBlurEvent={overstyrBlurEvent}
            changeField={changeField}
            formErrors={formErrors}
            visFeil={visFeil}
          />
        </Nav.Column>
      </Nav.Row>

      {mottakerErValgt && !valgtMottakerHarFeilmelding && (
        <Nav.Row>
          <Nav.Column xs={brevTypeSelectWidth}>
            <Skjema.Select
              feltNavn="type"
              label={<LabelMedHjelpetekst label="Velg brevmal" bold small />}
              redigerbart={
                !(!redigerbart || tilgjengeligeBrevtyper.length === 1 || !!formValues.valgtMottaker?.feilmelding)
              }
              emptyFieldDisabled={!!formValues.type}
              onBlur={overstyrBlurEvent}
              error={
                visFeil && (formErrors.type || formErrors.valgtBrev)
                  ? Utils.feilmelding.hentEnkeltFeilmelding(formErrors.type || formErrors.valgtBrev)
                  : undefined
              }
            >
              {tilgjengeligeBrevtyper.map((brevType) => (
                <option key={brevType.type.kode} value={brevType.type.kode}>
                  {brevType.type.term}
                </option>
              ))}
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
      )}

      {!valgtMottakerHarFeilmelding && (
        <BrevValg
          formValues={formValues}
          formErrors={formErrors}
          width={felterWidth}
          redigerbart={redigerbart}
          changeField={changeField}
          finnValgAlternativ={finnValgAlternativ}
          visFeil={visFeil}
        />
      )}

      {formIsValid && brevtypeErValgt && (muligeMottakere || muligeMottakereNorskMyndighet) && (
        <Nav.Row>
          <Nav.Column xs={mottakerTabellWidth}>
            <BrevMottakereTabell
              muligeMottakere={muligeMottakere}
              muligeMottakereNorskMyndighet={muligeMottakereNorskMyndighet}
              hentBrevRequest={hentBrevRequest}
            />
          </Nav.Column>
        </Nav.Row>
      )}

      {muligeMottakereFeil && (
        <Nav.Alert variant="warning" className="varsel">
          {muligeMottakereFeil}
        </Nav.Alert>
      )}

      {!valgtMottakerHarFeilmelding && (
        <BrevVedlegg
          fritekstvedlegg={fritekstvedlegg}
          setFritekstvedlegg={setFritekstvedlegg}
          valgteVedlegg={valgteVedlegg}
          setValgteVedlegg={setValgteVedlegg}
          changeField={changeField}
          formValues={formValues}
          redigerbart={redigerbart}
          behandlingID={behandlingID}
          dokumenter={dokumenter}
          mottakerErNorskMyndighet={mottakerErNorskMyndighet}
          visFritekstvedleggSkjema={visFritekstvedleggSkjema}
          setVisFritekstvedleggSkjema={setVisFritekstvedleggSkjema}
          redigerFritekstvedleggIndex={redigerFritekstVedleggIndex}
          setRedigerFritekstvedleggIndex={setRedigerFritekstvedleggIndex}
          muligeMottakere={muligeMottakere}
          standardvedlegg={harStandardVedlegg() ? standardvedleggListe : []}
        />
      )}

      <div className="send_brev__knapperad">
        <Nav.Button
          variant="primary"
          disabled={sendBrevSpinner}
          className="brevknapp"
          onClick={sendBrev}
          loading={sendBrevSpinner}
        >
          Send brev
        </Nav.Button>
        <Nav.Button
          variant="secondary"
          disabled={knappErDisabled}
          className="brevknapp"
          onClick={lagreUtkast}
          loading={lagreUtkastSpinner}
        >
          Lagre utkast
        </Nav.Button>
        <Nav.Button
          variant="secondary"
          disabled={!formValues.mottaker || !redigerbart || spinnerAktiv}
          className="brevknapp"
          onClick={forkastBrev}
          loading={forkastBrevSpinner}
        >
          Forkast brev
        </Nav.Button>
      </div>

      {brevSendt && (
        <Nav.Alert variant="success" className="brev_sendt" closeButton onClose={() => setBrevSendt(false)}>
          Brevet er bestilt. Det kan ta noe tid før brevet vises i dokumentlisten.
        </Nav.Alert>
      )}
      {visFeil && Object.keys(formErrors || {}).length > 0 && (
        <Nav.ErrorSummary heading="Følgende feil ble funnet:" className="valideringsfeil" size="small">
          {visRelevanteFeil(formErrors, formValues, {
            mottakerErArbeidsgiver,
            erAnnenOrganisasjon: erAnnenOrganisasjon(formValues?.valgtMottaker?.rolle),
          }).map(([field]) => {
            const errorMessage = Utils.feilmelding.hentEnkeltFeilmelding(formErrors[field]);
            return errorMessage ? (
              <Nav.ErrorSummary.Item key={field} href={`#${field}`}>
                {errorMessage}
              </Nav.ErrorSummary.Item>
            ) : null;
          })}
        </Nav.ErrorSummary>
      )}
    </div>
  );
}

const SendBrevForm = reduxForm<object, Props & PropsFromRedux>({
  form: KV.Form.SEND_BREV,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  keepValues: true,
  validate: lagYupToReduxformErrorMapper(sendBrevSchema),
})(SendBrev);

export default connector(SendBrevForm);
