import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import * as Nav from "../../../../navFrontend";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import Dokumentliste from "../../../../felleskomponenter/dokumentliste";
import * as Mui from "../../../../felleskomponenter/ui";
import { useCallback, useEffect, useState } from "react";
import * as Api from "../../../../services/api";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import vurdering_vedtak from "./vurderingVedtakSchema";
import * as Utils from "../../../../utils";
import { AarsavregningResponse } from "../../../../services/modules/aarsavregning/aarsavregning";
import { vedtakOperations } from "../../../../ducks/vedtak";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import { Action } from "redux";
import { kontrollOperations } from "../../../../ducks/kontroll";
import MKV from "../../../../melosyskodeverk";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import * as Forms from "../../../../felleskomponenter/forms";
import { SumArsavregningTabell } from "../vurderingAarsavregning/komponenter/sumArsavregningTabell";
import { menypanelOperations, menypanelSelectors } from "../../../../ducks/menypanel";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import FullmaktForTrygdeavgiftConfirmationPanel from "../../../../felleskomponenter/fullmaktForTrygdeavgiftConfirmationPanel/fullmaktForTrygdeavgiftConfirmationPanel";
import { BrevVedleggVisningstabellInterface } from "../../../../services/modules/dokumenter-v2";
import VedleggTable from "../../../../felleskomponenter/vedleggTable";

const { FASTSATT_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingsresultattyper;
const { FØRSTEGANGSVEDTAK } = MKV.Koder.vedtakstyper;
const { AARSAVREGNING_VEDTAKSBREV } = MKV.Koder.brev.produserbaredokumenter;
const { FULLMEKTIG_TRYGDEAVGIFT } = MKV.Koder.fullmaktstype;
const { FULLMEKTIG } = MKV.Koder.aktoersroller;
const { MANUELL_ENDELIG_AVGIFT } = MKV.Koder.aarsavregningBehandlingsvalg;

interface FormValuesProps {
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
  behandlingsvalg?: string;
}

interface Props {
  tilbake: () => void;
  aktivtSteg: boolean;
}

const MINSTEBELOP_FAKTURERING_ELLER_REFUSJON = 100;

const komponentDispatch = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  kontrollerFerdigbehandling: (data: Api.Kontroll.FerdigbehandlingKontrollData) =>
    dispatch(kontrollOperations.kontrollerFerdigbehandling(data)),
  fattVedtak: (behandlingID: number, body: Api.Saksflyt.Vedtak.FattVedtakÅrsavregningReqDto) =>
    dispatch(vedtakOperations.fatt(behandlingID, body)),
});

export function VurderingVedtak({ tilbake, aktivtSteg }: Props) {
  const dispatch = useDispatch();
  const [vedtakPending, setVedtakPending] = useState<boolean>(false);
  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());
  const [lagretAarsavregning, setLagretAarsavregning] = useState<AarsavregningResponse | undefined>(undefined);
  const [fakturaMottaker, setFakturaMottaker] = useState<string | undefined>(undefined);
  const [harFullmaktForTrygdeavgift, setHarFullmaktForTrygdeavgift] = useState(false);
  const [harBekreftetFullmaktForTrygdeavgift, setHarBekreftetFullmaktForTrygdeavgift] = useState(false);
  const [brevVedlegg, setBrevVedlegg] = useState<BrevVedleggVisningstabellInterface>({
    saksvedlegg: [],
    standardvedlegg: [],
  });
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const erFullmektigEndret = useSelector(menypanelSelectors.MenypanelErFullmektigEndretSelector) as boolean;
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector) as string | number | null;

  const { fattVedtak } = komponentDispatch(dispatch);

  const defaultBegrunnelse = useSelector(behandlingsresultatSelectors.BegrunnelseFritekstSelector) as string | undefined;
  const defaultInnledning = useSelector(behandlingsresultatSelectors.InnledningFritekstSelector) as string | undefined;

  const {
    watch,
    control,
    handleSubmit,
    setValue,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurdering_vedtak),
    defaultValues: {
      begrunnelseFritekst: defaultBegrunnelse || "",
      innledningFritekst: defaultInnledning || "",
      behandlingsvalg: undefined,
    } as FieldValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const formValues = watch();

  const fetchAvregningsData = () => {
    if (behandlingID === null) return Promise.resolve(undefined);
    return Api.Aarsavregning.hentAarsavregning(behandlingID).then((response: AarsavregningResponse) => {
      setLagretAarsavregning(response);
      return response;
    }).catch(error => {
      console.error("Error fetching aarsavregning data: ", error);
      return undefined;
    });
  };

  const hentMuligeMottakere = async () => {
    if (behandlingID === null) return;
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: AARSAVREGNING_VEDTAKSBREV,
      orgnr: null,
    });
    setMuligeMottakere(res);
    await hentStandardvedleggForBrev();
  };

  const hentStandardvedleggForBrev = async () => {
    Api.DokumenterV2.hentStandardvedleggForBrev(AARSAVREGNING_VEDTAKSBREV).then((res) => {
      setBrevVedlegg({
        saksvedlegg: [],
        standardvedlegg: res,
      });
    });
  };

  const hentOgSetHarFullmaktForTrygdeavgift = async () => {
    if (saksnummer === null || saksnummer === undefined) return;
    const saksnummerString = typeof saksnummer === 'number' ? saksnummer.toString() : saksnummer;
    if (typeof saksnummerString !== 'string') return;

    await Api.Fagsaker.aktoer.hent(saksnummerString, FULLMEKTIG).then((res) => {
      setHarBekreftetFullmaktForTrygdeavgift(false);
      setHarFullmaktForTrygdeavgift(
        res.some((aktoer) => aktoer.fullmakter?.some((fullmakt) => fullmakt === FULLMEKTIG_TRYGDEAVGIFT)),
      );
    });
  };

  useEffect(() => {
    if (aktivtSteg && behandlingID !== null) {
      window.scrollTo(0, 0);
      fetchAvregningsData().then((response) => {
        if (response?.behandlingsvalg) {
          setValue("behandlingsvalg", response.behandlingsvalg, { shouldValidate: false });
        }
      });
      hentMuligeMottakere();
      Api.Trygdeavgift.hentFakturamottaker(behandlingID).then((dto) => {
        setFakturaMottaker(dto.navn);
      });
      hentOgSetHarFullmaktForTrygdeavgift();
    }
  }, [aktivtSteg, behandlingID, setValue]);

  useEffect(() => {
    if (aktivtSteg && erFullmektigEndret && behandlingID !== null) {
      hentOgSetHarFullmaktForTrygdeavgift();
      Api.Trygdeavgift.hentFakturamottaker(behandlingID).then((dto) => {
        setFakturaMottaker(dto.navn);
      });
      dispatch(menypanelOperations.setErFullmektigEndret(false));
    }
  }, [aktivtSteg, erFullmektigEndret, behandlingID, dispatch]);

  const lagFattVedtakReqDto = (): Api.Saksflyt.Vedtak.FattVedtakÅrsavregningReqDto => {
    return {
      behandlingsresultatTypeKode: FASTSATT_TRYGDEAVGIFT,
      innledningFritekst: formValues?.innledningFritekst || null,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      vedtakstype: FØRSTEGANGSVEDTAK,
      kopiMottakere: muligeMottakere.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
    };
  };

  const onSubmit = async () => {
    if (behandlingID === null) {
      return;
    }

    const stegErGyldig = !harFullmaktForTrygdeavgift || erDifferanseUnderMinstebeløp || harBekreftetFullmaktForTrygdeavgift;
    if (!stegErGyldig) {
      return;
    }

    setVedtakPending(true);
    fattVedtak(behandlingID, lagFattVedtakReqDto())
      .then((res) => {
        if (res.data?.data?.error) {
          setVedtakPending(false);
        }
      })
      .catch(() => {
        setVedtakPending(false);
      });
  };

  const oppdaterFritekster = (values: FormValuesProps) => {
    if (values && redigerbart && !vedtakPending) {
      Api.Behandlinger.resultat.oppdaterFritekster(behandlingID, {
        innledningFritekst: values.innledningFritekst,
        begrunnelseFritekst: values.begrunnelseFritekst,
      });
    }
  };
  const debouncedOppdaterFritekster = useCallback(Utils._debounce(oppdaterFritekster, 1000), [behandlingID, redigerbart, vedtakPending]);

  useEffect(() => {
    if (aktivtSteg && behandlingID !== null) {
      debouncedOppdaterFritekster(formValues);
    }
  }, [aktivtSteg, formValues, debouncedOppdaterFritekster, behandlingID]);

  const mapMottakerRad = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return {
      dokumentData: {
        produserbardokument: AARSAVREGNING_VEDTAKSBREV,
        mottaker: muligMottaker.rolle,
        innledningFritekst: formValues?.innledningFritekst || null,
        begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
        orgNr: muligMottaker?.orgnr || null,
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

  const tidligereTrygdeavgift = lagretAarsavregning?.avregning?.tidligereFakturertBeloep;
  const tidligereTrygdeavgiftAvgiftssystem = lagretAarsavregning?.avregning?.tidligereFakturertBeloepAvgiftssystem;
  const nyTrygdeavgift =
    formValues?.behandlingsvalg === MANUELL_ENDELIG_AVGIFT
      ? lagretAarsavregning?.avregning?.manueltAvgiftBeloep
      : lagretAarsavregning?.avregning?.nyttTotalbeloep;

  const trygdeavgiftDiff =
    (nyTrygdeavgift ?? 0) - (tidligereTrygdeavgift ?? 0) - (tidligereTrygdeavgiftAvgiftssystem ?? 0);
  const erDifferanseUnderMinstebeløp = Math.abs(trygdeavgiftDiff) < MINSTEBELOP_FAKTURERING_ELLER_REFUSJON;
  const erNullKroner = trygdeavgiftDiff === 0;
  const skalFaktureres = trygdeavgiftDiff > 0;

  const kanSubmitte = redigerbart && !vedtakPending &&
    (!harFullmaktForTrygdeavgift || erDifferanseUnderMinstebeløp || harBekreftetFullmaktForTrygdeavgift);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="vurderingVedtak">
      <Nav.Heading level="1" className="stegvelgertittel">
        Vedtak årsavregning {lagretAarsavregning ? lagretAarsavregning.aar : ""}
      </Nav.Heading>

      {formValues?.behandlingsvalg === MANUELL_ENDELIG_AVGIFT && (
        <Nav.Alert variant="warning" className="blokk-s">
          Du har lagt inn "Endelig beregnet trygdeavgift" manuelt og må derfor oppgi en begrunnelse i fritekstfeltet.
        </Nav.Alert>
      )}

      <SumArsavregningTabell
        nyTrygdeavgift={nyTrygdeavgift}
        tidligereTrygdeavgift={tidligereTrygdeavgift}
        tidligereTrygdeavgiftAvgiftssystem={tidligereTrygdeavgiftAvgiftssystem}
        harGrunnlagIMelosys={tidligereTrygdeavgift !== null || lagretAarsavregning?.harDeltGrunnlag === true}
      />

      {fakturaMottaker ? (
        <Nav.Row className="trygdeavgift">
          <Nav.Column xs="12">
            <Nav.BodyLong size="small" className="info">
              {erDifferanseUnderMinstebeløp ? (
                !erNullKroner && <b>Beløpet er under minstegrensen for fakturering/refusjon (100 kr).</b>
              ) : (
                <>
                  <br />
                  {`${skalFaktureres ? "Faktura" : "Kreditnota"} på ${Utils.formaterTilNorskBelop(Math.abs(trygdeavgiftDiff)) || "0"
                    } kr sendes til: `}{" "}
                  <b>{fakturaMottaker}</b>
                </>
              )}
            </Nav.BodyLong>
          </Nav.Column>
        </Nav.Row>
      ) : null}

      {redigerbart && !erDifferanseUnderMinstebeløp && harFullmaktForTrygdeavgift ? (
        <FullmaktForTrygdeavgiftConfirmationPanel
          harBekreftet={harBekreftetFullmaktForTrygdeavgift}
          onChange={setHarBekreftetFullmaktForTrygdeavgift}
        />
      ) : null}

      <Nav.BodyLong weight="semibold" size="small" className="fritekst_overskrift">
        <LabelMedHjelpetekst label="Fritekst til innledning" hjelpetekst="" />
      </Nav.BodyLong>
      <Forms.HtmlEditor
        name="innledningFritekst"
        control={control}
        className="fritekst_editor"
        disabled={!redigerbart}
      />

      <Nav.BodyLong weight="semibold" size="small" className="fritekst_overskrift">
        <LabelMedHjelpetekst label="Fritekst til begrunnelse" hjelpetekst="" />
      </Nav.BodyLong>
      <Forms.HtmlEditor
        name="begrunnelseFritekst"
        control={control}
        className="fritekst_editor"
        disabled={!redigerbart}
      />

      {formIsValid && redigerbart && muligeMottakere && behandlingID !== null && (!harFullmaktForTrygdeavgift || erDifferanseUnderMinstebeløp || harBekreftetFullmaktForTrygdeavgift) && (
        <>
          <Dokumentliste behandlingID={behandlingID} dokumenter={mapMottakerRader(muligeMottakere)} />
          <VedleggTable
            valgteVedlegg={brevVedlegg}
            setValgteVedlegg={() => {
              /* Readonly */
            }}
            label="Vedlegg"
            redigerbart={false /* Readonly. Ikke vis slett-knapp. */}
          />
        </>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !kanSubmitte,
          loading: vedtakPending,
          type: "submit",
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart || vedtakPending, type: "button" }}
      />
    </form>
  );
}