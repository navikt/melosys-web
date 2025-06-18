import { yupResolver } from "@hookform/resolvers/yup";
import { RootState } from "AppTypes";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { kontrollOperations } from "../../../../ducks/kontroll";
import { menypanelOperations, menypanelSelectors } from "../../../../ducks/menypanel";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { vedtakOperations } from "../../../../ducks/vedtak";
import Dokumentliste from "../../../../felleskomponenter/dokumentliste";
import * as Forms from "../../../../felleskomponenter/forms";
import FullmaktForTrygdeavgiftConfirmationPanel from "../../../../felleskomponenter/fullmaktForTrygdeavgiftConfirmationPanel/fullmaktForTrygdeavgiftConfirmationPanel";
import * as Mui from "../../../../felleskomponenter/ui";
import VedleggTable from "../../../../felleskomponenter/vedleggTable";
import { useDispatch } from "../../../../hooks";
import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Api from "../../../../services/api";
import { AarsavregningResponse } from "../../../../services/modules/aarsavregning/aarsavregning";
import { BrevVedleggVisningstabellInterface } from "../../../../services/modules/dokumenter-v2";
import * as Utils from "../../../../utils";
import { SumArsavregningTabell } from "../vurderingAarsavregning/komponenter/sumArsavregningTabell";
import { beregnSumTilFakturaEllerRefusjon } from "../vurderingAarsavregning/utils";
import "./vurderingVedtak.css";
import vurdering_vedtak from "./vurderingVedtakSchema";

const { FASTSATT_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingsresultattyper;
const { FØRSTEGANGSVEDTAK } = MKV.Koder.vedtakstyper;
const { AARSAVREGNING_VEDTAKSBREV } = MKV.Koder.brev.produserbaredokumenter;
const { FULLMEKTIG_TRYGDEAVGIFT } = MKV.Koder.fullmaktstype;
const { FULLMEKTIG } = MKV.Koder.aktoersroller;
const { MANUELL_ENDELIG_AVGIFT } = MKV.Koder.endeligAvgiftValg;

interface FormValuesProps {
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
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
  const [harSkjemaverdier, setHarSkjemaverdier] = useState(false);
  const [fritekstPending, setFritekstPending] = useState(false);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const erFullmektigEndret = useSelector(menypanelSelectors.MenypanelErFullmektigEndretSelector) as boolean;
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector) as string | number | null;

  const { fattVedtak } = komponentDispatch(dispatch);

  const [lagretInnledning, setLagretInnledning] = useState<string>(
    useSelector(behandlingsresultatSelectors.InnledningFritekstSelector) ?? "",
  );
  const [lagretBegrunnelse, setLagretBegrunnelse] = useState<string>(
    useSelector(behandlingsresultatSelectors.BegrunnelseFritekstSelector) ?? "",
  );

  const {
    watch,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isValid: formIsValid },
  } = useForm<FormValuesProps>({
    resolver: yupResolver(vurdering_vedtak),
    context: { endeligAvgiftValg: lagretAarsavregning?.endeligAvgiftValg },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const formValues = watch();

  const fetchAarsavregning = useCallback(async (): Promise<AarsavregningResponse | undefined> => {
    if (behandlingID === null) return undefined;
    try {
      const response = await Api.Aarsavregning.hentAarsavregning(behandlingID);
      setLagretAarsavregning(response);
      return response;
    } catch (error) {
      console.error("Henting av aarsavregning feilet: ", error);
      return undefined;
    }
  }, [behandlingID]);

  const fetchMuligeMottakere = useCallback(async () => {
    if (behandlingID === null) return;
    try {
      const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
        produserbartdokument: AARSAVREGNING_VEDTAKSBREV,
        orgnr: null,
      });
      setMuligeMottakere(res);
      await fetchStandardvedleggForBrev();
    } catch (error) {
      console.error("Henting av muligeMottakere feilet: ", error);
    }
  }, [behandlingID]);

  const fetchStandardvedleggForBrev = useCallback(async () => {
    try {
      const res = await Api.DokumenterV2.hentStandardvedleggForBrev(AARSAVREGNING_VEDTAKSBREV);
      setBrevVedlegg({
        saksvedlegg: [],
        standardvedlegg: res,
      });
    } catch (error) {
      console.error("Henting av vedlegg feilet: ", error);
    }
  }, []);

  const fetchFakturaMottaker = useCallback(async () => {
    if (behandlingID === null) return;
    try {
      const dto = await Api.Trygdeavgift.hentFakturamottaker(behandlingID);
      setFakturaMottaker(dto.navn);
    } catch (error) {
      console.error("Henting av fakturamottaker feilet: ", error);
    }
  }, [behandlingID]);

  const fetchAndSetHarFullmaktForTrygdeavgift = useCallback(async () => {
    if (saksnummer === null || saksnummer === undefined) return;
    const saksnummerString = typeof saksnummer === "number" ? saksnummer.toString() : saksnummer;
    if (typeof saksnummerString !== "string") return;

    try {
      const res = await Api.Fagsaker.aktoer.hent(saksnummerString, FULLMEKTIG);
      setHarBekreftetFullmaktForTrygdeavgift(false);
      setHarFullmaktForTrygdeavgift(
        res.some((aktoer) => aktoer.fullmakter?.some((fullmakt) => fullmakt === FULLMEKTIG_TRYGDEAVGIFT)),
      );
    } catch (error) {
      console.error("Henting av fullmakt feilet: ", error);
    }
  }, [saksnummer]);

  useEffect(() => {
    if (aktivtSteg && behandlingID !== null) {
      setHarSkjemaverdier(false);
      window.scrollTo(0, 0);
      Promise.all([
        fetchAarsavregning(),
        fetchMuligeMottakere(),
        fetchFakturaMottaker(),
        fetchAndSetHarFullmaktForTrygdeavgift(),
      ]);
    }
  }, [
    aktivtSteg,
    behandlingID,
    fetchAarsavregning,
    fetchMuligeMottakere,
    fetchFakturaMottaker,
    fetchAndSetHarFullmaktForTrygdeavgift,
  ]);

  useEffect(() => {
    if (aktivtSteg && lagretAarsavregning) {
      const currentValues = getValues();
      const nyInnledningFritekst = currentValues.innledningFritekst ?? lagretInnledning ?? "";
      const nyBegrunnelseFritekst = currentValues.begrunnelseFritekst ?? lagretBegrunnelse ?? "";

      if (!harSkjemaverdier) {
        reset(
          {
            innledningFritekst: nyInnledningFritekst,
            begrunnelseFritekst: nyBegrunnelseFritekst,
          },
          { keepDirty: false },
        );
        setLagretInnledning(nyInnledningFritekst);
        setLagretBegrunnelse(nyBegrunnelseFritekst);
        setHarSkjemaverdier(true);
      }
    }
  }, [aktivtSteg, lagretAarsavregning, reset, lagretInnledning, lagretBegrunnelse, getValues, harSkjemaverdier]);

  useEffect(() => {
    if (aktivtSteg && erFullmektigEndret && behandlingID !== null) {
      fetchAndSetHarFullmaktForTrygdeavgift();
      fetchFakturaMottaker();
      dispatch(menypanelOperations.setErFullmektigEndret(false));
    }
  }, [
    aktivtSteg,
    erFullmektigEndret,
    behandlingID,
    dispatch,
    fetchAndSetHarFullmaktForTrygdeavgift,
    fetchFakturaMottaker,
  ]);

  const oppdaterFritekster = useCallback(
    (values: FormValuesProps) => {
      if (values && redigerbart && !vedtakPending && behandlingID !== null) {
        const payload = {
          innledningFritekst: values.innledningFritekst,
          begrunnelseFritekst: values.begrunnelseFritekst,
        };
        Api.Behandlinger.resultat
          .oppdaterFritekster(behandlingID, payload)
          .then(() => {
            setLagretInnledning(values.innledningFritekst ?? "");
            setLagretBegrunnelse(values.begrunnelseFritekst ?? "");
          })
          .catch((error) => {
            console.error("Oppdatering av fritekster feilet: ", error);
          })
          .finally(() => {
            setFritekstPending(false);
          });
      }
    },
    [behandlingID, redigerbart, vedtakPending],
  );

  const debouncedOppdaterFritekster = useCallback(Utils._debounce(oppdaterFritekster, 1000), [oppdaterFritekster]);

  useEffect(() => {
    if (redigerbart && aktivtSteg && behandlingID !== null && lagretAarsavregning && harSkjemaverdier) {
      const currentValues = getValues();
      const hasInnledningChanged = (currentValues.innledningFritekst ?? "") !== lagretInnledning;
      const hasBegrunnelseChanged = (currentValues.begrunnelseFritekst ?? "") !== lagretBegrunnelse;

      if (hasInnledningChanged || hasBegrunnelseChanged) {
        setFritekstPending(true);
        debouncedOppdaterFritekster(currentValues);
      }
    }
  }, [
    aktivtSteg,
    formValues,
    debouncedOppdaterFritekster,
    behandlingID,
    lagretAarsavregning,
    harSkjemaverdier,
    getValues,
    lagretInnledning,
    lagretBegrunnelse,
  ]);

  if (!aktivtSteg || !lagretAarsavregning || !harSkjemaverdier) {
    return null;
  }

  const onSubmit = async () => {
    if (behandlingID === null || !lagretAarsavregning) {
      return;
    }

    const stegErGyldig =
      !harFullmaktForTrygdeavgift || erDifferanseUnderMinstebeløp || harBekreftetFullmaktForTrygdeavgift;
    if (!stegErGyldig) {
      return;
    }

    setVedtakPending(true);
    fattVedtak(behandlingID, {
      behandlingsresultatTypeKode: FASTSATT_TRYGDEAVGIFT,
      innledningFritekst: formValues?.innledningFritekst || null,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      vedtakstype: FØRSTEGANGSVEDTAK,
      kopiMottakere: muligeMottakere.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
    })
      .then((res) => {
        if (res.data?.data?.error) {
          console.error("Error during fattVedtak: ", res.data.data.error);
          setVedtakPending(false);
        }
      })
      .catch((error) => {
        console.error("Error submitting vedtak: ", error);
        setVedtakPending(false);
      });
  };

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
    const rader = [];
    if (mottakere.hovedMottaker) {
      rader.push(mapMottakerRad(mottakere.hovedMottaker));
    }
    rader.push(...mottakere.kopiMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker)));
    rader.push(...mottakere.fasteMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker)));
    return rader;
  };

  const tidligereTrygdeavgift = lagretAarsavregning?.avregning?.tidligereFakturertBeloep;
  const trygdeavgiftFraAvgiftssystemet = lagretAarsavregning?.avregning?.trygdeavgiftFraAvgiftssystemet;
  const nyTrygdeavgift =
    lagretAarsavregning?.endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT
      ? lagretAarsavregning?.avregning?.manueltAvgiftBeloep
      : lagretAarsavregning?.avregning?.beregnetAvgiftBelop;

  const tidligereTrygdeavgiftFraAvgiftssystemet =
    lagretAarsavregning?.tidligereGrunnlagsopplysninger?.tidligereTrygdeavgiftFraAvgiftssystemet;

  const sumTilFakturaEllerRefusjon = beregnSumTilFakturaEllerRefusjon(
    nyTrygdeavgift,
    tidligereTrygdeavgift,
    trygdeavgiftFraAvgiftssystemet,
    tidligereTrygdeavgiftFraAvgiftssystemet,
  );
  const erDifferanseUnderMinstebeløp = Math.abs(sumTilFakturaEllerRefusjon) < MINSTEBELOP_FAKTURERING_ELLER_REFUSJON;
  const erNullKroner = sumTilFakturaEllerRefusjon === 0;
  const skalFaktureres = sumTilFakturaEllerRefusjon > 0;

  const kanSubmitte =
    redigerbart &&
    !vedtakPending &&
    (!harFullmaktForTrygdeavgift || erDifferanseUnderMinstebeløp || harBekreftetFullmaktForTrygdeavgift);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="vurderingVedtak">
      <Nav.Heading level="1" className="stegvelgertittel">
        Vedtak årsavregning {lagretAarsavregning ? lagretAarsavregning.aar : ""}
      </Nav.Heading>

      {redigerbart && lagretAarsavregning?.endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT && (
        <Nav.Alert variant="warning">
          Du har lagt inn &quot;Endelig beregnet trygdeavgift&quot; manuelt og må derfor oppgi en begrunnelse i
          fritekstfeltet.
        </Nav.Alert>
      )}

      <SumArsavregningTabell
        nyTrygdeavgift={nyTrygdeavgift}
        tidligereTrygdeavgift={tidligereTrygdeavgift}
        tidligereTrygdeavgiftAvgiftssystem={trygdeavgiftFraAvgiftssystemet}
        harGrunnlagIMelosys={
          tidligereTrygdeavgift !== null || lagretAarsavregning?.harTrygdeavgiftFraAvgiftssystemet === true
        }
        tidligereAarsavregningTrygdeavgiftFraAvgiftssystem={tidligereTrygdeavgiftFraAvgiftssystemet}
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
                  {`${skalFaktureres ? "Faktura" : "Kreditnota"} på ${
                    Utils.formaterTilNorskBelop(Math.abs(sumTilFakturaEllerRefusjon)) || "0"
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

      <Forms.HtmlEditor
        name="innledningFritekst"
        control={control}
        className="fritekst_editor"
        disabled={!redigerbart}
        label="Fritekst til innledning"
      />

      <Forms.HtmlEditor
        name="begrunnelseFritekst"
        control={control}
        className="fritekst_editor"
        disabled={!redigerbart}
        label="Fritekst til begrunnelse"
      />

      {formIsValid &&
        redigerbart &&
        muligeMottakere &&
        behandlingID !== null &&
        (!harFullmaktForTrygdeavgift || erDifferanseUnderMinstebeløp || harBekreftetFullmaktForTrygdeavgift) &&
        !fritekstPending && (
          <>
            <Dokumentliste behandlingID={behandlingID} dokumenter={mapMottakerRader(muligeMottakere)} />
            <VedleggTable valgteVedlegg={brevVedlegg} setValgteVedlegg={() => {}} label="Vedlegg" redigerbart={false} />
          </>
        )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !kanSubmitte,
          loading: vedtakPending || fritekstPending,
          type: "submit",
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart || vedtakPending, type: "button" }}
      />
    </form>
  );
}
