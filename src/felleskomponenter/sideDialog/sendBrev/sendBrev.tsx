import { FocusEvent, useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps, useSelector } from "react-redux";
import { change, getFormSyncErrors, getFormValues, reduxForm, reset } from "redux-form";
import { touchAll as touchAllFieldsOp } from "../../../ducks/form/operations";
import { ColumnWidth } from "nav-frontend-grid";

import { useMsal } from "@azure/msal-react";

import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../skjema";
import * as Utils from "../../../utils";
import {
  FysiskDokument,
  BrevVedleggInterface,
  BrevVedleggVisningstabellInterface,
} from "../../../services/modules/dokumenter-v2";

import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { behandlingerOperations } from "../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { formSelectors } from "../../../ducks/form";

import BrevMottaker, { erAnnenOrganisasjon, erNorskMyndighet, skalViseBrevmalvalg } from "./brevMottaker/brevMottaker";
import BrevMottakereTabell from "./brevMottaker/brevMottakereTabell";
import Brevutkast from "./brevutkast/brevutkast";
import BrevValgMedPlaceholdere from "./brevValgMedPlaceholdere";
import PlaceholderUtdatertVarsel from "./placeholderUtdatertVarsel";
import { SendBrevFormValues } from "./types";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER, MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../../featuretoggle/toggleNavn";
import {
  finnUtdaterteVerdier,
  harInnsatteVerdier,
  hentVerdier,
  UtdatertPlaceholder,
} from "../../../services/modules/placeholdere";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import sendBrevSchema from "./sendBrevSchema";
import "./sendBrev.less";
import { Fritekstvedlegg } from "./brevVedlegg/brevVedlegg";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst";
import { untouch } from "redux-form";

const { VIRKSOMHET, ARBEIDSGIVER, ANNEN_ORGANISASJON, NORSK_MYNDIGHET, UTENLANDSK_TRYGDEMYNDIGHET } =
  MKV.Koder.mottakerroller;

const mapStateToProps = (state: RootState) => ({
  formIsValid: formSelectors.SendBrevValidSelector(state),
  formValues: getFormValues(KV.Form.SEND_BREV)(state),
  initialValues: {
    felt: {},
  },
  soknadsland: mottatteOpplysningerSelectors.SoknadslandSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  changeField: (field: string, data: unknown) => dispatch(change(KV.Form.SEND_BREV, field, data)),
  resetForm: () => dispatch(reset(KV.Form.SEND_BREV)),
  oppdaterBehandling: () => dispatch(behandlingerOperations.oppdaterBehandling()),
  touchAllFields: () => dispatch(touchAllFieldsOp(KV.Form.SEND_BREV)),
  untouchFields: (...fields: string[]) => dispatch(untouch(KV.Form.SEND_BREV, ...fields)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  redigerbart: boolean;
  behandlingID: number;
  brevTypeSelectWidth?: ColumnWidth;
  mottakerSelectWidth?: ColumnWidth;
  mottakerTabellWidth?: ColumnWidth;
  felterWidth?: ColumnWidth;
  formValues: SendBrevFormValues;
  dokumenter: FysiskDokument[];
  syncErrors?: { [key: string]: string };
}

function SendBrev({
  behandlingID,
  changeField,
  formValues,
  formIsValid,
  oppdaterBehandling,
  redigerbart,
  resetForm,
  dokumenter,
  touchAllFields,
  brevTypeSelectWidth = "12",
  mottakerSelectWidth = "12",
  mottakerTabellWidth = "12",
  felterWidth = "12",
  soknadsland,
  sakstype,
  untouchFields,
}: Props & PropsFromRedux) {
  const [tilgjengeligeMaler, setTilgjengeligeMaler] = useState<Api.DokumenterV2.TilgjengeligeMalerResDto>();
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [standardvedleggListe, setStandardvedleggListe] = useState<Api.DokumenterV2.TilgjengeligStandardvedlegg[]>([]);
  const [muligeMottakere, setMuligeMottakere] = useState<Api.DokumenterV2.HentMuligeMottakereResDto>();
  const [muligeMottakereFeil, setMuligeMottakereFeil] = useState<string | undefined>(undefined);
  const [muligeMottakereNorskMyndighet, setMuligeMottakereNorskMyndighet] =
    useState<Api.DokumenterV2.MuligMottaker[]>();
  const [visBrevBestiltAlert, setVisBrevBestiltAlert] = useState(false);
  const [feil, setFeil] = useState<string | undefined>();
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
  const [utdaterteVerdier, setUtdaterteVerdier] = useState<UtdatertPlaceholder[]>([]);
  const brevBestiltTimerRef = useRef<number | undefined>(undefined);
  const tilgjengeligeMottakere = useMemo(
    () => tilgjengeligeMaler?.map((mal) => mal.mottaker) || [],
    [tilgjengeligeMaler],
  );
  const tilgjengeligeBrevtyper = useMemo(
    () => tilgjengeligeMaler?.find((mal) => mal?.mottaker.uuid === formValues?.mottaker)?.brevTyper || [],
    [tilgjengeligeMaler, formValues?.mottaker],
  );
  const mottakerErNorskMyndighet = erNorskMyndighet(formValues?.valgtMottaker?.rolle);
  // Backend krever begge: placeholdere er en utvidelse av tekstblokk-funksjonaliteten.
  const tekstblokkerPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  const { accounts } = useMsal();
  const syncErrors = useSelector((state: RootState) => getFormSyncErrors(KV.Form.SEND_BREV)(state));

  // Hent ferske verdier direkte fra store i hooks under
  const currentValues = useSelector((state: RootState) => getFormValues(KV.Form.SEND_BREV)(state)) as
    | SendBrevFormValues
    | undefined;

  // Hvis bruker allerede har forsøkt å sende, sørg for at showFieldErrors ikke blir skrudd av ved mal-endring
  useEffect(() => {
    if (submitAttempted && currentValues?.showFieldErrors !== true) {
      changeField("showFieldErrors", true);
    }
  }, [submitAttempted, currentValues?.showFieldErrors, changeField]);

  // Etter mal-bytte: vent til feltene er mountet, deretter touch alle felter slik at inline-feil vises videre
  useLayoutEffect(() => {
    if (!submitAttempted) return;
    touchAllFields();
  }, [submitAttempted, currentValues?.type, currentValues?.valgtBrev, touchAllFields]);

  const setValgteVedleggIState = (valgteVedleggFraVisningstabell: BrevVedleggVisningstabellInterface) => {
    setValgteVedlegg({
      saksvedlegg: valgteVedleggFraVisningstabell.saksvedlegg,
      standardvedlegg: valgteVedleggFraVisningstabell.standardvedlegg[0] ?? null, // Det er kun ett vedlegg i BrevVedleggTableInterface når vi bruker VedleggVelger.
    });
  };

  const valgtMottakerHarFeilmelding = formValues?.valgtMottaker?.feilmelding;

  const hentUtkast = () =>
    Api.Brevutkast.hentBrevutkast(behandlingID).then((response) => setUtkastPåBehandlingen(response));

  const hentTilgjengeligeMaler = () =>
    Api.DokumenterV2.hentTilgjengeligeMaler(behandlingID).then((response) => {
      response.forEach((mal) => {
        mal.mottaker.uuid = Utils._uuid();
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
        return skalViseBrevmalvalg(values);
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
    return () => {
      if (brevBestiltTimerRef.current) {
        clearTimeout(brevBestiltTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (formIsValid && submitAttempted) {
      setSubmitAttempted(false);
    }
  }, [formIsValid, submitAttempted]);

  const resetVedleggState = () => {
    setValgteVedlegg({ saksvedlegg: [], standardvedlegg: null });
    setFritekstvedlegg([]);
    setVisFritekstvedleggSkjema(false);
    setRedigerFritekstvedleggIndex(undefined);
  };

  const resetSkjemafelter = () => {
    changeField("felt", {}); // tømmer alle dynamiske felter
    changeField("fritekstTittel", undefined);
    changeField("erFeltGyldig", undefined);
    changeField("organisasjonsnummer", undefined);
    changeField("organisasjonFunnetForOrgnr", undefined);
    changeField("kontaktperson", undefined);
    changeField("norskeMyndigheter", undefined);
    changeField("kopiTilBruker", undefined);
  };

  const prevValgtBrevRef = useRef<Api.DokumenterV2.TilgjengeligBrev | undefined>(undefined);
  useEffect(() => {
    const prevValgtBrev = prevValgtBrevRef.current;
    const currentValgtBrev = formValues?.valgtBrev;

    // Only reset if both previous and current are defined and different
    if (prevValgtBrev && currentValgtBrev && prevValgtBrev !== currentValgtBrev) {
      resetVedleggState();
      resetSkjemafelter();
    }

    prevValgtBrevRef.current = currentValgtBrev;
  }, [formValues?.valgtBrev]);

  useEffect(() => {
    if ((!formValues?.valgtMottaker?.rolle && !formValues?.mottaker) || formValues?.aktivtUtkast) return;
    // Reset vedlegg og skjemafelter ved mottaker-endring
    resetVedleggState();
    resetSkjemafelter();
    // Sørg for at type/valgtBrev velges på nytt for ny mottaker
    changeField("type", undefined);
    changeField("valgtBrev", undefined);
    // Tilbakestill feilhåndtering og varsler
    changeField("showFieldErrors", false);
    if (submitAttempted) setSubmitAttempted(false);
    setFeil(undefined);
    setVisBrevBestiltAlert(false);
    setMuligeMottakereFeil(undefined);
  }, [formValues?.mottaker, formValues?.valgtMottaker?.rolle]);

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
    formValues?.organisasjonFunnetForOrgnr,
    formValues?.arbeidsgiver,
    formValues?.norskeMyndigheter,
  ]);

  useEffect(() => {
    if (formValues?.aktivtUtkast) return;
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

  // Full reset av underfelter (verdier + touched) når valgt brevmal endres
  useEffect(() => {
    const felter = formValues?.valgtBrev?.felter;
    if (!felter || formValues?.aktivtUtkast) return;

    changeField("showFieldErrors", false);
    changeField("felt", {});

    const pathsToUntouch: string[] = ["type"];
    felter.forEach((f) => {
      pathsToUntouch.push(`felt.${f.kode}.valg`, `felt.${f.kode}.feltVerdi`);
    });
    untouchFields(...pathsToUntouch);
  }, [formValues?.valgtBrev?.type]);

  useEffect(() => {
    setMuligeMottakereFeil(undefined);
    if (kanHenteMuligeMottakere(formValues)) {
      hentMuligeMottakere();
    }
  }, [
    formValues?.valgtBrev,
    formValues?.organisasjonsnummer,
    formValues?.organisasjonFunnetForOrgnr,
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
        return valgtAlternativ?.visFelt ? (feltVerdi ?? null) : null;
      }

      if (hentKode) {
        return valgtAlternativ?.kode ?? null;
      }

      return valgtAlternativ?.visFelt ? (feltVerdi ?? null) : (valgtAlternativ?.beskrivelse ?? null);
    }
    return feltVerdi ?? null;
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

  // Fritekstfeltene brevet faktisk sendes med. hentFormVerdi gir null for felter som ikke
  // vises, så ferskhetssjekken under kan gjenbruke nøyaktig dette utvalget.
  const hentFritekstFelter = () => ({
    innledningFritekst: hentFormVerdi("INNLEDNING_FRITEKST"),
    manglerFritekst: hentFormVerdi("MANGLER_FRITEKST"),
    fritekst: hentFormVerdi("FRITEKST"),
  });

  const hentBrevRequest = (mottakerRolle: string): Api.DokumenterV2.OpprettBrevReqDto => ({
    produserbardokument: formValues.type || "",
    mottaker: mottakerRolle,
    orgNr: hentOrgnr(mottakerRolle),
    kontaktpersonNavn: erAnnenOrganisasjon(mottakerRolle) ? formValues.kontaktperson : null,
    orgnrNorskMyndighet: formValues.norskeMyndigheter,
    ...hentFritekstFelter(),
    fritekstTittel: hentFormVerdi("BREV_TITTEL", true),
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

  // Kun teksten som blir med i bestillingen – fritekstvedleggene inkludert, siden de sendes
  // sammen med brevet og kan ha innsatte verdier.
  const hentFritekstHtml = () =>
    [...Object.values(hentFritekstFelter()), ...fritekstvedlegg.map(({ fritekst }) => fritekst)]
      .filter(Boolean)
      .join("");

  const hentUtdaterteVerdier = async (html: string): Promise<UtdatertPlaceholder[]> => {
    try {
      const { verdier } = await hentVerdier(behandlingID);
      return finnUtdaterteVerdier(html, verdier);
    } catch {
      // Uten ferske verdier har vi ingenting å sammenligne mot; brevet sendes uten varsel.
      return [];
    }
  };

  const sendBrev = async () => {
    if (!formValues?.valgtMottaker) return;

    if (!formIsValid) {
      setSubmitAttempted(true);
      changeField("showFieldErrors", true);
      touchAllFields();
      return;
    }

    const fritekstHtml = tekstblokkerPaa && dynamiskPlaceholderPaa ? hentFritekstHtml() : "";
    // Uten innsatte verdier er det ingenting å sammenligne, og oppslaget er unødvendig.
    if (harInnsatteVerdier(fritekstHtml)) {
      setSendBrevSpinner(true);
      const utdaterte = await hentUtdaterteVerdier(fritekstHtml);
      if (utdaterte.length > 0) {
        setSendBrevSpinner(false);
        setUtdaterteVerdier(utdaterte);
        return;
      }
    }

    bestillBrev();
  };

  const bestillBrev = () => {
    if (!formValues?.valgtMottaker) return;

    setSendBrevSpinner(true);
    setFeil(undefined);

    const brevRequest: Api.DokumenterV2.OpprettBrevReqDto = {
      ...hentBrevRequest(formValues.valgtMottaker.rolle),
      produserbardokument: formValues.type || "",
      mottaker: formValues.valgtMottaker.rolle,
    };

    Api.DokumenterV2.opprettBrev(behandlingID, brevRequest)
      .then(() => {
        setVisBrevBestiltAlert(true);
        // Utsett sideeffekter som kan trigge remount til etter at varselet er vist
        brevBestiltTimerRef.current = window.setTimeout(() => {
          setVisBrevBestiltAlert(false);
          oppdaterBehandling();
          slettMatchendeUtkast(brevRequest);
          resetFormOgFritekstvedleggState();
        }, 3000);
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

  const slettMatchendeUtkast = async (brevRequest: Api.DokumenterV2.OpprettBrevReqDto) => {
    // Finn alle utkast som matcher det sendte brevet
    const matchendeUtkast = utkastPåBehandlingen.filter(
      (utkast) =>
        utkast.brevbestilling.produserbardokument?.kode === brevRequest.produserbardokument &&
        utkast.brevbestilling.mottaker === brevRequest.mottaker,
    );

    // Slett alle matchende utkast
    for (const utkast of matchendeUtkast) {
      await Api.Brevutkast.slettBrevutkast(behandlingID, utkast.utkastBrevID).catch(() => {
        // Ignorer feil ved sletting av enkelt utkast
      });
    }

    // Hvis det var et aktivt utkast, nullstill det
    if (formValues?.aktivtUtkast) {
      changeField("aktivtUtkast", null);
    }

    // Oppdater listen over utkast
    await hentUtkast();
  };

  const forkastBrev = async () => {
    setForkastBrevSpinner(true);
    resetFormOgFritekstvedleggState();
    setVisBrevBestiltAlert(false);
    setFeil(undefined);
    setMuligeMottakereFeil(undefined);
    await slettUtkast();
    setForkastBrevSpinner(false);
  };

  const resetFormOgFritekstvedleggState = () => {
    resetForm();
    changeField("showFieldErrors", false);
    setFritekstvedlegg([]);
    setVisFritekstvedleggSkjema(false);
    setRedigerFritekstvedleggIndex(undefined);
  };

  const lagreUtkast = () => {
    if (!formValues?.valgtMottaker) return;
    setLagreUtkastSpinner(true);
    setFeil(undefined);

    const requestData: Api.DokumenterV2.OpprettBrevReqDto = {
      ...hentBrevRequest(formValues.valgtMottaker.rolle),
      produserbardokument: formValues.type || "",
      mottaker: formValues.valgtMottaker.rolle,
    };

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

  if (!tilgjengeligeMaler || !formValues) {
    return null;
  }

  const mottakerErValgt = formValues.valgtMottaker;
  const brevtypeErValgt = formValues.valgtBrev;

  const spinnerAktiv = sendBrevSpinner || lagreUtkastSpinner || forkastBrevSpinner;

  const sendBrevAktiveringskravOppfylt = Boolean(mottakerErValgt && brevtypeErValgt);

  const knappErDisabled =
    !redigerbart ||
    !sendBrevAktiveringskravOppfylt ||
    !!formValues?.valgtMottaker?.feilmelding ||
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

      <Nav.Row className="brevmottaker__wrapper">
        <Nav.Column xs={mottakerSelectWidth}>
          <BrevMottaker
            redigerbart={redigerbart}
            tilgjengeligeMottakere={tilgjengeligeMottakere}
            overstyrBlurEvent={overstyrBlurEvent}
            changeField={changeField}
          />
        </Nav.Column>
      </Nav.Row>

      {skalViseBrevmalvalg(formValues) && (
        <Nav.Row>
          <Nav.Column xs={brevTypeSelectWidth}>
            <Skjema.Select
              feltNavn="type"
              label={<LabelMedHjelpetekst label="Velg brevmal" bold small />}
              readonly={!redigerbart || tilgjengeligeBrevtyper.length === 1 || !!formValues?.valgtMottaker?.feilmelding}
              emptyFieldDisabled={!!formValues?.type}
              onBlur={overstyrBlurEvent}
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
        <BrevValgMedPlaceholdere
          behandlingID={behandlingID}
          formValues={formValues}
          width={felterWidth}
          redigerbart={redigerbart}
          changeField={changeField}
          finnValgAlternativ={finnValgAlternativ}
        />
      )}

      {formIsValid && brevtypeErValgt && (muligeMottakere || muligeMottakereNorskMyndighet) && (
        <Nav.Row>
          <Nav.Column xs={mottakerTabellWidth}>
            <BrevMottakereTabell
              muligeMottakere={muligeMottakere}
              muligeMottakereNorskMyndighet={muligeMottakereNorskMyndighet}
              redigerbart={redigerbart}
              saksbehandlerNrToIdent={finnSaksbehandlerIdentForDobbelSignatur()}
              brevVedlegg={{
                fritekstvedlegg,
                setFritekstvedlegg,
                valgteVedlegg,
                setValgteVedlegg: setValgteVedleggIState,
                changeField,
                dokumenter,
                visFritekstvedleggSkjema,
                setVisFritekstvedleggSkjema,
                redigerFritekstvedleggIndex: redigerFritekstVedleggIndex,
                setRedigerFritekstvedleggIndex: setRedigerFritekstvedleggIndex,
                standardvedlegg: standardvedleggListe,
              }}
            />
          </Nav.Column>
        </Nav.Row>
      )}

      {muligeMottakereFeil && (
        <Nav.Alert variant="warning" className="varsel">
          {muligeMottakereFeil}
        </Nav.Alert>
      )}

      <div className="send_brev__knapperad">
        {submitAttempted && !formIsValid && (
          <Nav.Alert variant="error" className="varsel">
            {Utils.feilmelding.syncErrorsTilFeilmelding(syncErrors || {})}
          </Nav.Alert>
        )}
        <Nav.Button
          variant="primary"
          disabled={knappErDisabled}
          className="brevknapp"
          onClick={() => void sendBrev()}
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

      {utdaterteVerdier.length > 0 && (
        <PlaceholderUtdatertVarsel
          utdaterte={utdaterteVerdier}
          onSendLikevel={() => {
            setUtdaterteVerdier([]);
            bestillBrev();
          }}
          onAvbryt={() => setUtdaterteVerdier([])}
        />
      )}

      {visBrevBestiltAlert && (
        <Nav.Alert variant="success" className="brev_sendt">
          Brevet er bestilt. Det kan ta noe tid før brevet vises i dokumentlisten.
        </Nav.Alert>
      )}
      {feil && (
        <Nav.Alert variant="error" className="brev_sendt">
          {feil}
        </Nav.Alert>
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
