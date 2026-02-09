import { useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../../../hooks";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import { MedlemskapsperiodeForAvgift } from "../../../../../services/modules/types/periodeTyper";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import * as KV from "../../../../../kodeverk";

import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { medlemskapsperioderSelectors } from "../../../../../ducks/medlemskapsperioder";
import { mottatteOpplysningerSelectors } from "../../../../../ducks/mottatteOpplysninger";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { landkoderSelectors } from "../../../../../ducks/landkoder";
import { kontrollOperations, kontrollSelectors } from "../../../../../ducks/kontroll";
import { vedtakOperations } from "../../../../../ducks/vedtak";
import { formSelectors } from "../../../../../ducks/form";
import LabelMedHjelpetekst from "../../../../../felleskomponenter/labelMedHjelpetekst";
import Dokumentliste from "../../../../../felleskomponenter/dokumentliste";

import vurdering_vedtak from "./vurderingVedtakSchema";
import "./vurderingVedtak.less";
import { KTObject } from "@navikt/melosys-kodeverk";
import { feiletResponsSelectors } from "../../../../../ducks/feiletRespons";
import { NY_VURDERING_BAKGRUNN_HJELPETEKST } from "../../../../ikkeYrkesaktiv/stegKomponenter/vurderingVedtak/tekster";
import { FRITEKST_VALG } from "../../../../../kodeverk/koder";
import { menypanelOperations, menypanelSelectors } from "../../../../../ducks/menypanel";
import { fagsakSelectors } from "../../../../../ducks/fagsaker";
import FullmaktForTrygdeavgiftConfirmationPanel from "../../../../../felleskomponenter/fullmaktForTrygdeavgiftConfirmationPanel/fullmaktForTrygdeavgiftConfirmationPanel";
import { TrygdeavgiftMottaker } from "./trygdeavgiftMottaker/trygdeavgiftMottaker";
import { Betalingsvalg } from "./betalingsvalg/betalingsvalg";
import useFeatureToggle from "../../../../../featuretoggle/useFeatureToggle";
import { MELOSYS_PENSJONIST } from "../../../../../featuretoggle/toggleNavn";

const { FØRSTEGANG, NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT, SATSENDRING } =
  MKV.Koder.behandlinger.behandlingstyper;
const { IKKE_YRKESAKTIV, PENSJONIST } = MKV.Koder.behandlinger.behandlingstema;
const { OPPHØRT } = MKV.Koder.innvilgelsesResultat;
const { OPPHØRSVEDTAK, FØRSTEGANGSVEDTAK, ENDRINGSVEDTAK } = MKV.Koder.vedtakstyper;
const { FULLMEKTIG_TRYGDEAVGIFT } = MKV.Koder.fullmaktstype;
const { FULLMEKTIG } = MKV.Koder.aktoersroller;
const { TRYGDEAVGIFT_BETALES_TIL_SKATT } = MKV.Koder.trygdeavgiftmottaker;
const {
  INNVILGELSE_FOLKETRYGDLOVEN,
  VEDTAK_OPPHOERT_MEDLEMSKAP,
  IKKE_YRKESAKTIV_PLIKTIG_FTRL,
  IKKE_YRKESAKTIV_FRIVILLIG_FTRL,
  PLIKTIG_MEDLEM_FTRL,
  PENSJONIST_FRIVILLIG_FTRL,
  PENSJONIST_PLIKTIG_FTRL,
} = MKV.Koder.brev.produserbaredokumenter;
const { MEDLEM_I_FOLKETRYGDEN, DELVIS_OPPHØRT } = MKV.Koder.behandlinger.behandlingsresultattyper;
const { PLIKTIG } = MKV.Koder.medlemskapstyper;

const innledningFritekstHjelpetekst =
  "Teksten du skriver her vil vises etter informasjonen om vedtakets periode og resultat. Eksempel: \n\n" +
  '"Du er medlem i folketrygden fra 1. september 2022 til 31. desember 2024. Medlemskapet omfatter trygdedekning i folketrygdens helse- og pensjonsdel."\n\n' +
  "Friteksten kommer her.";
const begrunnelseFritekstHjelpetekst =
  "Teksten du skriver her vil vises etter standard begrunnelse for bestemmelsen.  Eksempel: \n\n" +
  '"Du har opplyst at du arbeider for Equinor ASA i Brasil. Vi har lagt til grunn at du er ansatt i en virksomhet med hovedsete i Norge."\n\n' +
  "Friteksten kommer her.";
const trygdeavgiftFritekstHjelpetekst =
  "Teksten du skriver her vil vises etter standard informasjon om trygdeavgiften. Eksempel: \n\n" +
  '"Ved kalenderårets slutt vil vi be om endelige inntektsopplysninger. Ut fra disse opplysningene vil vi beregne endelig trygdeavgift for året."\n\n' +
  "Friteksten kommer her.";

const komponentDispatch = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  kontrollerFerdigbehandling: (data: Api.Kontroll.FerdigbehandlingKontrollData) =>
    dispatch(kontrollOperations.kontrollerFerdigbehandling(data)),
  fattVedtak: (behandlingID: number, body: Api.Saksflyt.Vedtak.FattVedtakFTRLReqDto) =>
    dispatch(vedtakOperations.fatt(behandlingID, body)),
});

interface FormValuesProps {
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
  trygdeavgiftFritekst?: string;
}

interface Props {
  tilbake: () => void;
  aktivtSteg: boolean;
}

export function VurderingVedtak({ tilbake, aktivtSteg }: Props) {
  const dispatch = useDispatch();
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const medlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const soknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const flereLandUkjenteHvilke = useSelector(mottatteOpplysningerSelectors.SoknadslandFlereLandUkjentHvilkeSelector);
  const mottatteOpplysningerFeilmeldinger = useSelector(formSelectors.SoknadErrorsSelector);
  const lagretVedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const alleLandkoder = useSelector(landkoderSelectors.LandkoderSelector);
  const mottatteOpplysningerStatus = useSelector(mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const lagretNyVurderingBakgrunn = useSelector(behandlingsresultatSelectors.NyVurderingBakgrunnSelector);
  const erFullmektigEndret = useSelector(menypanelSelectors.MenypanelErFullmektigEndretSelector);
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const kontrollfeil = useSelector(kontrollSelectors.KontrollFeilSelector);
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector);
  const { kontrollerFerdigbehandling, fattVedtak } = komponentDispatch(dispatch);

  const [betalingsvalg, setBetalingsvalg] = useState(MKV.Koder.betalingstype.TREKK);
  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());
  const [trygdeavgiftMottaker, setTrygdeavgiftMottaker] = useState<KTObject | undefined>(undefined);
  const [fakturamottaker, setFakturamottaker] = useState<string | undefined>(undefined);
  const [vedtakPending, setVedtakPending] = useState(false);
  const [harFullmaktForTrygdeavgift, setHarFullmaktForTrygdeavgift] = useState(false);
  const [harBekreftetFullmaktForTrygdeavgift, setHarBekreftetFullmaktForTrygdeavgift] = useState(false);

  const erFørstegang = behandlingstype === FØRSTEGANG;
  const erNyVurdering = behandlingstype === NY_VURDERING;
  const erSatsendring = behandlingstype === SATSENDRING;
  const erManglendeInnbetalingTrygdeavgift = behandlingstype === MANGLENDE_INNBETALING_TRYGDEAVGIFT;
  const erDelvisOpphør = medlemskapsperioder.some((periode) => periode.innvilgelsesResultat === OPPHØRT);
  const erIkkeYrkesaktiv = behandlingstema === IKKE_YRKESAKTIV;
  const erPensjonist = behandlingstema === PENSJONIST;
  const medlemskapsTypeErPliktig = medlemskapsperioder.some((periode) => periode.medlemskapstype === PLIKTIG);
  const betalingsvalgErFaktura = betalingsvalg === MKV.Koder.betalingstype.FAKTURA;
  const mottakerErSkatt = trygdeavgiftMottaker?.kode === TRYGDEAVGIFT_BETALES_TIL_SKATT;
  const bestemmelserkodeverk: string[] = [
    ...Object.values(MKV.KTObjects.folketrygdloven_kap2_bestemmelser),
    ...Object.values(MKV.KTObjects.vertslandsavtale_bestemmelser),
  ] as string[];

  const visFakturaMottaker = betalingsvalgErFaktura || (fakturamottaker && !erIkkeYrkesaktiv && !erPensjonist);
  const visBetalingsvalg = erFørstegang && erPensjonist && !mottakerErSkatt;

  const erPensjonistToggleEnabled = useFeatureToggle(MELOSYS_PENSJONIST);

  const hentProduserbardokumentType = () => {
    if (erDelvisOpphør) {
      return VEDTAK_OPPHOERT_MEDLEMSKAP;
    }
    if (erPensjonist) {
      return medlemskapsTypeErPliktig ? PENSJONIST_PLIKTIG_FTRL : PENSJONIST_FRIVILLIG_FTRL;
    }
    if (erIkkeYrkesaktiv) {
      return medlemskapsTypeErPliktig ? IKKE_YRKESAKTIV_PLIKTIG_FTRL : IKKE_YRKESAKTIV_FRIVILLIG_FTRL;
    }
    return medlemskapsTypeErPliktig ? PLIKTIG_MEDLEM_FTRL : INNVILGELSE_FOLKETRYGDLOVEN;
  };

  const erNyVurderingBakgrunnValgFritekst = (nyVurderingBakgrunnValg?: string): boolean => {
    return !MKV.KTObjects.begrunnelser.nyvurderingbakgrunner?.some((bakgrunn: KTObject) => {
      return bakgrunn.kode === nyVurderingBakgrunnValg;
    });
  };
  const initialNyVurderingBakgrunnValg =
    lagretNyVurderingBakgrunn && erNyVurderingBakgrunnValgFritekst(lagretNyVurderingBakgrunn)
      ? FRITEKST_VALG
      : lagretNyVurderingBakgrunn || undefined;
  const initialNyVurderingBakgrunnFritekst =
    initialNyVurderingBakgrunnValg === FRITEKST_VALG ? lagretNyVurderingBakgrunn : "";

  const {
    watch,
    control,
    formState: { isValid: formIsValid },
    setValue,
  } = useForm({
    resolver: yupResolver(vurdering_vedtak),
    context: {
      erNyVurdering,
      erManglendeInnbetalingTrygdeavgift,
      erDelvisOpphør,
    },
    defaultValues: {
      begrunnelseFritekst: useSelector(behandlingsresultatSelectors.BegrunnelseFritekstSelector) || "",
      innledningFritekst: useSelector(behandlingsresultatSelectors.InnledningFritekstSelector) || "",
      trygdeavgiftFritekst: useSelector(behandlingsresultatSelectors.TrygdeavgiftFritekstSelector) || "",
      nyVurderingBakgrunnValg: initialNyVurderingBakgrunnValg,
      nyVurderingBakgrunnFritekst: initialNyVurderingBakgrunnFritekst,
    } as FieldValues,
  });
  const formValues = watch();

  const mottatteOpplysningerErGyldig = () => Utils._isEmpty(mottatteOpplysningerFeilmeldinger);
  let oppdaterFørKontroll = true;

  const oppdaterNyVurderingBakgrunn = (nyVurderingBakgrunn?: string) => {
    Api.Behandlinger.resultat.oppdaterNyVurderingBakgrunn(behandlingID, nyVurderingBakgrunn);
  };
  const debouncedOppdaterNyVurderingBakgrunn = useCallback(Utils._debounce(oppdaterNyVurderingBakgrunn, 500), []);

  const oppdaterNyVurderingBakgrunnValg = (nyVurderingBakgrunnValg: string) => {
    if (!erNyVurdering) {
      return;
    }
    if (nyVurderingBakgrunnValg === FRITEKST_VALG) {
      debouncedOppdaterNyVurderingBakgrunn(undefined);
    } else {
      debouncedOppdaterNyVurderingBakgrunn(nyVurderingBakgrunnValg);
    }
    setValue("nyVurderingBakgrunnFritekst", "");
  };

  useEffect(() => {
    return () => debouncedOppdaterFritekster.cancel();
  }, []);

  const hentMuligeMottakere = async () => {
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: hentProduserbardokumentType(),
      orgnr: null,
    });
    setMuligeMottakere(res);
  };

  const hentBetalingsvalg = async () => {
    const fagsakDto = await Api.Fagsaker.fagsak.hent(saksnummer);

    if (fagsakDto.betalingsvalg) {
      setBetalingsvalg(fagsakDto.betalingsvalg.kode);
    }
  };

  useEffect(() => {
    if (redigerbart) {
      hentMuligeMottakere();
    }
  }, [erDelvisOpphør]);

  useEffect(() => {
    if (aktivtSteg) {
      Api.Trygdeavgift.hentTrygdeavgiftMottaker(behandlingID).then((dto) => {
        setTrygdeavgiftMottaker(dto.trygdeavgiftMottaker);
      });

      if (erPensjonist && erPensjonistToggleEnabled) {
        hentBetalingsvalg();
      }
    }
  }, [aktivtSteg]);

  useEffect(() => {
    if (erFullmektigEndret) {
      hentMuligeMottakere();
    }
  }, [erFullmektigEndret]);

  useEffect(() => {
    if (aktivtSteg && (erFullmektigEndret || !fakturamottaker)) {
      Api.Fagsaker.aktoer.hent(saksnummer, FULLMEKTIG).then((res) => {
        setHarBekreftetFullmaktForTrygdeavgift(false);
        setHarFullmaktForTrygdeavgift(
          res.some((aktoer) => aktoer.fullmakter?.some((fullmakt) => fullmakt === FULLMEKTIG_TRYGDEAVGIFT)),
        );
      });

      Api.Trygdeavgift.hentFakturamottaker(behandlingID).then((mottaker) => {
        setFakturamottaker(mottaker.navn);
      });

      if (erFullmektigEndret) {
        dispatch(menypanelOperations.setErFullmektigEndret(false));
      }
    }
  }, [aktivtSteg, erFullmektigEndret]);

  const oppdaterFritekster = (values: FormValuesProps) => {
    if (values && redigerbart && !vedtakPending) {
      Api.Behandlinger.resultat.oppdaterFritekster(behandlingID, {
        innledningFritekst: values.innledningFritekst,
        begrunnelseFritekst: values.begrunnelseFritekst,
        trygdeavgiftFritekst: values.trygdeavgiftFritekst,
      });
    }
  };
  const debouncedOppdaterFritekster = useCallback(Utils._debounce(oppdaterFritekster, 1000), []);

  useEffect(() => {
    debouncedOppdaterFritekster(formValues);
  }, [formValues?.innledningFritekst, formValues?.begrunnelseFritekst, formValues?.trygdeavgiftFritekst]);

  const getOpphørsdato = () =>
    [...medlemskapsperioder]
      .sort(Utils.dato.sorterEtterISOFomDato)
      .find((periode) => periode.innvilgelsesResultat === OPPHØRT)?.fomDato;

  const getVedtakstype = () => {
    if (lagretVedtakstype) return lagretVedtakstype;
    if (erManglendeInnbetalingTrygdeavgift) return erDelvisOpphør ? OPPHØRSVEDTAK : ENDRINGSVEDTAK;
    if (erNyVurdering) return ENDRINGSVEDTAK;
    return FØRSTEGANGSVEDTAK;
  };

  const lagFattVedtakReqDto = (): Api.Saksflyt.Vedtak.FattVedtakFTRLReqDto => {
    return {
      behandlingsresultatTypeKode: erDelvisOpphør ? DELVIS_OPPHØRT : MEDLEM_I_FOLKETRYGDEN,
      innledningFritekst: formValues?.innledningFritekst || null,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      trygdeavgiftFritekst: formValues?.trygdeavgiftFritekst || null,
      vedtakstype: getVedtakstype(),
      kopiMottakere: muligeMottakere.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
      nyVurderingBakgrunn:
        formValues?.nyVurderingBakgrunnValg === FRITEKST_VALG
          ? formValues?.nyVurderingBakgrunnFritekst
          : formValues?.nyVurderingBakgrunnValg,
      opphoerDato: erDelvisOpphør ? getOpphørsdato() : null,
    };
  };

  async function kontroller(data: any) {
    if (data.aktivtSteg && redigerbart && data.mottatteOpplysningerStatus === "OK") {
      setVedtakPending(true);
      const request = {
        behandlingID,
        vedtakstype: getVedtakstype(),
        behandlingsresultattype: erDelvisOpphør ? DELVIS_OPPHØRT : MEDLEM_I_FOLKETRYGDEN,
        skalRegisteropplysningerOppdateres: oppdaterFørKontroll,
      };
      oppdaterFørKontroll = false;
      await kontrollerFerdigbehandling(request);
      setVedtakPending(false);
    }
  }

  const debouncedKontrollerBehandling = useCallback(Utils._debounce(kontroller, 500), [kontrollerFerdigbehandling]);

  useEffect(() => {
    debouncedKontrollerBehandling({ aktivtSteg, mottatteOpplysningerStatus, formValues });
  }, [aktivtSteg, redigerbart, mottatteOpplysningerStatus]);

  const onSubmit = async () => {
    setVedtakPending(true);
    if (mottatteOpplysningerErGyldig()) {
      if (visBetalingsvalg && erPensjonistToggleEnabled) {
        await Api.Fagsaker.fagsak.lagreBetalingsvalgForPensjonister(saksnummer, betalingsvalg);
      }

      fattVedtak(behandlingID, lagFattVedtakReqDto()).then((res) => {
        if (res.data?.data?.error) {
          setVedtakPending(false);
        }
      });
    } else {
      setVedtakPending(false);
    }
  };

  if (!aktivtSteg) return null;

  const mapPeriodeRader = (perioder: MedlemskapsperiodeForAvgift[]) =>
    [...perioder].sort(Utils.dato.sorterEtterISOFomDato).map((it) => ({
      periode: `${Utils.dato.formatterDatoTilNorsk(it.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(it.tomDato)}`,
      bestemmelse: KV.finnTermFraListe(bestemmelserkodeverk, it.bestemmelse),
      dekning: KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, it.trygdedekning),
      resultat: KV.finnTermFraListe(MKV.KTObjects.innvilgelsesResultat, it.innvilgelsesResultat),
    }));

  const mapMottakerRad = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return {
      dokumentData: {
        produserbardokument: hentProduserbardokumentType(),
        mottaker: muligMottaker.rolle,
        innledningFritekst: formValues?.innledningFritekst || null,
        begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
        trygdeavgiftFritekst: formValues?.trygdeavgiftFritekst || null,
        nyVurderingBakgrunn:
          formValues?.nyVurderingBakgrunnValg === FRITEKST_VALG
            ? formValues?.nyVurderingBakgrunnFritekst
            : formValues?.nyVurderingBakgrunnValg,
        orgNr: muligMottaker?.orgnr || null,
        opphoerDato: erDelvisOpphør ? getOpphørsdato() : null,
      },
      mottakerNavn: muligMottaker.mottakerNavn,
      dokumentNavn: muligMottaker.dokumentNavn,
    };
  };

  const mapMottakerRader = (mottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return [
      mapMottakerRad(mottakere.hovedMottaker),
      ...mottakere.kopiMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker)),
      ...mottakere.fasteMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker)),
    ];
  };

  const landEllerArbeidslandTekst = () => {
    if (flereLandUkjenteHvilke) return "Flere land. Ikke kjent hvilke";

    return alleLandkoder
      ? Utils.streng.arrayTilKonjunksjon(
          soknadsland.map((enkeltLand: string) => KV.finnTermFraListe(alleLandkoder, enkeltLand)),
        )
      : `Finner ikke ${erIkkeYrkesaktiv ? "land" : "arbeidsland"}`;
  };

  const stegErGyldig =
    redigerbart &&
    formIsValid &&
    Utils._isEmpty(feilmeldinger) &&
    Utils._isEmpty(kontrollfeil) &&
    (!harFullmaktForTrygdeavgift || harBekreftetFullmaktForTrygdeavgift);

  const oppdaterBetalingsvalg = () => {
    const valg =
      betalingsvalg === MKV.Koder.betalingstype.TREKK ? MKV.Koder.betalingstype.FAKTURA : MKV.Koder.betalingstype.TREKK;

    setBetalingsvalg(valg);

    Api.Fagsaker.fagsak.lagreBetalingsvalgForPensjonister(saksnummer, valg);
  };

  return (
    <div className="vurderingVedtak">
      <Nav.Heading level="1" className="stegvelgertittel">
        {medlemskapsTypeErPliktig
          ? "Pliktig medlemskap etter folketrygdloven"
          : "Frivillig medlemskap etter folketrygdloven"}
      </Nav.Heading>
      <Nav.Table size="small" className="melosys__table">
        <Nav.Table.Header>
          <Nav.Table.Row>
            <Nav.Table.HeaderCell scope="col">Periode</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Bestemmelse</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Dekning</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell scope="col">Resultat</Nav.Table.HeaderCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {mapPeriodeRader(medlemskapsperioder).map((medlemskapsperiode) => {
            return (
              <Nav.Table.Row key={Utils._uuid()}>
                <Nav.Table.DataCell>{medlemskapsperiode.periode}</Nav.Table.DataCell>
                <Nav.Table.DataCell>{medlemskapsperiode.bestemmelse}</Nav.Table.DataCell>
                <Nav.Table.DataCell>{medlemskapsperiode.dekning}</Nav.Table.DataCell>
                <Nav.Table.DataCell>{medlemskapsperiode.resultat}</Nav.Table.DataCell>
              </Nav.Table.Row>
            );
          })}
        </Nav.Table.Body>
      </Nav.Table>
      <Nav.Row>
        <Nav.Column xs="5" className="arbeidsland">
          <Nav.BodyLong weight="semibold" size="small" className="info">
            {erIkkeYrkesaktiv || erPensjonist ? "Land: " : "Arbeidsland: "}
          </Nav.BodyLong>
          <Nav.BodyLong size="small" className="info">
            {landEllerArbeidslandTekst()}
          </Nav.BodyLong>
        </Nav.Column>
      </Nav.Row>

      <Nav.Row className="trygdeavgift">
        {trygdeavgiftMottaker && erPensjonist ? (
          <TrygdeavgiftMottaker
            mottaker={trygdeavgiftMottaker.term}
            betalingsvalg={betalingsvalg}
            erFørstegang={erFørstegang}
          />
        ) : null}
        {visBetalingsvalg && (
          <Betalingsvalg
            skalSendeFaktura={betalingsvalgErFaktura}
            onBetalingsvalgChange={oppdaterBetalingsvalg}
            redigerbart={redigerbart}
          />
        )}
        {visFakturaMottaker && (
          <Nav.Column xs="12" className={visBetalingsvalg ? "fakturamottaker--indent" : "fakturamottaker"}>
            <Nav.BodyLong size="small" className="info">
              Faktura sendes til: &nbsp;
            </Nav.BodyLong>

            <Nav.BodyLong size="small" className="bold">
              {fakturamottaker}
            </Nav.BodyLong>
          </Nav.Column>
        )}
      </Nav.Row>

      {harFullmaktForTrygdeavgift && redigerbart && (!erPensjonist || betalingsvalgErFaktura) ? (
        <FullmaktForTrygdeavgiftConfirmationPanel
          erPensjonist={erPensjonist}
          harBekreftet={harBekreftetFullmaktForTrygdeavgift}
          onChange={setHarBekreftetFullmaktForTrygdeavgift}
        />
      ) : null}

      {(erNyVurdering || (erManglendeInnbetalingTrygdeavgift && !erDelvisOpphør)) && (
        <div className="nyVurderingBakgrunn">
          <Nav.Row>
            <Nav.Column xs="6">
              <Forms.Select
                label={
                  <LabelMedHjelpetekst
                    label="Oppgi grunn for nytt vedtak (Obligatorisk)"
                    hjelpetekst={NY_VURDERING_BAKGRUNN_HJELPETEKST}
                  />
                }
                name="nyVurderingBakgrunnValg"
                readOnly={!redigerbart}
                emptyFieldDisabled={!!formValues?.nyVurderingBakgrunnValg}
                control={control}
                onChange={oppdaterNyVurderingBakgrunnValg}
                className="nyVurderingBakgrunn_select"
              >
                {MKV.KTObjects.begrunnelser.nyvurderingbakgrunner?.map((bakgrunn: KTObject) => (
                  <option key={bakgrunn.kode} value={bakgrunn.kode} label={bakgrunn.term || ""} />
                ))}
                <option key={FRITEKST_VALG} value={FRITEKST_VALG} label={FRITEKST_VALG} />
              </Forms.Select>
            </Nav.Column>
          </Nav.Row>
          {formValues.nyVurderingBakgrunnValg === FRITEKST_VALG && (
            <Nav.Row className="nyVurderingBakgrunnFritekstRad">
              <Forms.HtmlEditor
                name="nyVurderingBakgrunnFritekst"
                control={control}
                onChange={debouncedOppdaterNyVurderingBakgrunn}
                className="nyVurderingBakgrunn--fritekst_editor"
                disabled={!redigerbart}
              />
            </Nav.Row>
          )}
        </div>
      )}
      {!erSatsendring && (
        <>
          {!erDelvisOpphør && (
            <>
              <Nav.BodyLong weight="semibold" size="small" className="fritekst_overskrift">
                <LabelMedHjelpetekst label="Fritekst til innledning" hjelpetekst={innledningFritekstHjelpetekst} />
              </Nav.BodyLong>
              <Forms.HtmlEditor
                name="innledningFritekst"
                control={control}
                className="fritekst_editor"
                disabled={!redigerbart}
              />
            </>
          )}

          <Nav.BodyLong weight="semibold" size="small" className="fritekst_overskrift">
            <LabelMedHjelpetekst label="Fritekst til begrunnelse" hjelpetekst={begrunnelseFritekstHjelpetekst} />
          </Nav.BodyLong>
          <Forms.HtmlEditor
            name="begrunnelseFritekst"
            control={control}
            className="fritekst_editor"
            disabled={!redigerbart}
          />

          {!erIkkeYrkesaktiv && !erDelvisOpphør && (
            <>
              <Nav.BodyLong weight="semibold" size="small" className="fritekst_overskrift">
                <LabelMedHjelpetekst
                  label="Fritekst til avsnitt om trygdeavgift"
                  hjelpetekst={trygdeavgiftFritekstHjelpetekst}
                />
              </Nav.BodyLong>
              <Forms.HtmlEditor
                name="trygdeavgiftFritekst"
                control={control}
                className="fritekst_editor"
                disabled={!redigerbart}
              />
            </>
          )}
        </>
      )}
      {stegErGyldig && muligeMottakere && (
        <Dokumentliste behandlingID={behandlingID} dokumenter={mapMottakerRader(muligeMottakere)} />
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: onSubmit,
          disabled: !stegErGyldig || !formIsValid,
          loading: vedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}
