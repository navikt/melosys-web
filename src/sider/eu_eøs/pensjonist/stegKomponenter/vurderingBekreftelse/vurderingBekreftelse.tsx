import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import MKV from "../../../../../melosyskodeverk";
import * as Forms from "../../../../../felleskomponenter/forms";
import "./vurderingBekreftelse.less";
import * as Api from "../../../../../services/api";
import * as Utils from "../../../../../utils";

import { useSelector } from "react-redux";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import Dokumentliste from "../../../../../felleskomponenter/dokumentliste";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import vurdering_bekreftelse from "./vurderingBekreftelseSchema";
import { Betalingsvalg } from "../../../../ftrl/saksbehandling/stegKomponenter/vurderingVedtak/betalingsvalg/betalingsvalg";
import { useCallback, useEffect, useState } from "react";
import { fagsakSelectors } from "../../../../../ducks/fagsaker";
import { useDispatch } from "../../../../../hooks";
import { tilForsiden } from "../../../../../ducks/navigering/operations";
import { KTObject } from "@navikt/melosys-kodeverk";
import FullmaktForTrygdeavgiftConfirmationPanel from "../../../../../felleskomponenter/fullmaktForTrygdeavgiftConfirmationPanel/fullmaktForTrygdeavgiftConfirmationPanel";
import { feiletResponsSelectors } from "../../../../../ducks/feiletRespons";
import { kontrollOperations, kontrollSelectors } from "../../../../../ducks/kontroll";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import { Action } from "redux";
import { vedtakOperations } from "../../../../../ducks/vedtak";
import { mottatteOpplysningerSelectors } from "../../../../../ducks/mottatteOpplysninger";

const { FULLMEKTIG } = MKV.Koder.aktoersroller;
const { TRYGDEAVGIFT_BETALES_TIL_NAV, TRYGDEAVGIFT_BETALES_TIL_NAV_OG_SKATT } = MKV.Koder.trygdeavgiftmottaker;
const { FASTSATT_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingsresultattyper;
const { FØRSTEGANGSVEDTAK, ENDRINGSVEDTAK } = MKV.Koder.vedtakstyper;
const { NY_VURDERING } = MKV.Koder.behandlinger.behandlingstyper;

const komponentDispatch = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  kontrollerFerdigbehandling: (data: Api.Kontroll.FerdigbehandlingKontrollData) =>
    dispatch(kontrollOperations.kontrollerFerdigbehandling(data)),
  fattVedtak: (behandlingID: number, body: Api.Saksflyt.Vedtak.FattVedtakFTRLReqDto) =>
    dispatch(vedtakOperations.fatt(behandlingID, body)),
});
interface FormValuesProps {
  begrunnelseFritekst?: string;
}
type PdfDokumentData = {
  dokumentData: {
    produserbardokument: any;
    mottaker: any;
    begrunnelseFritekst?: string;
  };
};

interface Props {
  tilbake: () => void;
  aktivtSteg: boolean;
}

const { FØRSTEGANG } = MKV.Koder.behandlinger.behandlingstyper;
const { PENSJONIST } = MKV.Koder.behandlinger.behandlingstema;

function VurderingBekreftelse({ tilbake, aktivtSteg }: Props) {
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const erNyVurdering = behandlingstype === NY_VURDERING;
  const [fakturamottaker, setFakturamottaker] = useState<string | undefined>(undefined);
  const [fullmektigErFakturamottaker, setFullmektigErFakturamottaker] = useState(false);
  const [harBekreftetFullmaktForTrygdeavgift, setHarBekreftetFullmaktForTrygdeavgift] = useState(false);
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const kontrollfeil = useSelector(kontrollSelectors.KontrollFeilSelector);
  const mottatteOpplysningerStatus = useSelector(mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);

  const erFørstegang = behandlingstype === FØRSTEGANG;
  const erPensjonist = behandlingstema === PENSJONIST;

  const lagretVedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);

  const dispatch = useDispatch();
  const { kontrollerFerdigbehandling } = komponentDispatch(dispatch);
  const [betalingsvalg, setBetalingsvalg] = useState(MKV.Koder.betalingstype.TREKK);
  const [pdfDokumenter, setPdfDokumenter] = useState<PdfDokumentData[]>([]);
  const [vedtakPending, setVedtakPending] = useState(false);
  const [trygdeavgiftMottaker, setTrygdeavgiftMottaker] = useState<KTObject | undefined>(undefined);
  const mottakerErNav =
    trygdeavgiftMottaker?.kode === TRYGDEAVGIFT_BETALES_TIL_NAV ||
    trygdeavgiftMottaker?.kode === TRYGDEAVGIFT_BETALES_TIL_NAV_OG_SKATT;

  const erRedigerbarBetalingsvalg = erFørstegang && erPensjonist && redigerbart;

  const stegErGyldig = Utils._isEmpty(feilmeldinger) && Utils._isEmpty(kontrollfeil);
  let oppdaterFørKontroll = true;

  const {
    watch,
    control,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurdering_bekreftelse),
    defaultValues: {
      begrunnelseFritekst: useSelector(behandlingsresultatSelectors.BegrunnelseFritekstSelector) || "",
    } as FormValuesProps,
  });

  const formValues = watch();
  const hentBetalingsvalg = async () => {
    const fagsakDto = await Api.Fagsaker.fagsak.hent(saksnummer);

    if (fagsakDto.betalingsvalg) {
      setBetalingsvalg(fagsakDto.betalingsvalg.kode);
    }
  };

  useEffect(() => {
    if (aktivtSteg) {
      hentTrygdeavgiftMottaker();
      hentPdfDokumenter();
      hentBetalingsvalg();
      hentFakturamottaker();
    }
  }, [aktivtSteg]);

  const hentFakturamottaker = () => {
    Api.Fagsaker.aktoer
      .hent(saksnummer, FULLMEKTIG)
      .then((res) => {
        if (res.length > 0) {
          setFullmektigErFakturamottaker(true);
        } else {
          setFullmektigErFakturamottaker(false);
        }
      })
      .catch(() => {
        setFullmektigErFakturamottaker(false);
      });

    Api.Trygdeavgift.hentFakturamottaker(behandlingID).then((mottaker) => {
      setFakturamottaker(mottaker.navn);
    });
  };

  const oppdaterFritekster = (values: FormValuesProps) => {
    if (values && redigerbart && !vedtakPending) {
      Api.Behandlinger.resultat.oppdaterFritekster(behandlingID, {
        innledningFritekst: "",
        begrunnelseFritekst: values.begrunnelseFritekst,
      });
    }
  };

  const debouncedOppdaterFritekster = useCallback(Utils._debounce(oppdaterFritekster, 500), []);

  useEffect(() => {
    debouncedOppdaterFritekster(formValues);
  }, [formValues?.begrunnelseFritekst]);

  const hentTrygdeavgiftMottaker = () => {
    Api.Trygdeavgift.hentTrygdeavgiftMottaker(behandlingID).then((dto) => {
      setTrygdeavgiftMottaker(dto.trygdeavgiftMottaker);
    });
  };

  const hentPdfDokumenter = () => {
    Api.Fagsaker.aktoer.hent(saksnummer, MKV.Koder.aktoersroller.FULLMEKTIG).then((fullmektigListe) => {
      setPdfDokumenter([
        {
          dokumentData: {
            produserbardokument: MKV.Koder.brev.produserbaredokumenter.TRYGDEAVGIFT_INFORMASJONSBREV,
            mottaker:
              fullmektigListe?.length > 0 &&
              fullmektigListe?.find((fullmektig) =>
                fullmektig.fullmakter?.includes(MKV.Koder.fullmaktstype.FULLMEKTIG_TRYGDEAVGIFT),
              )
                ? MKV.Koder.mottakerroller.FULLMEKTIG
                : MKV.Koder.mottakerroller.BRUKER,
          },
        },
      ]);
    });
  };

  const oppdaterBetalingsvalg = () => {
    const valg =
      betalingsvalg === MKV.Koder.betalingstype.TREKK ? MKV.Koder.betalingstype.FAKTURA : MKV.Koder.betalingstype.TREKK;

    setBetalingsvalg(valg);

    Api.Fagsaker.fagsak.lagreBetalingsvalgForPensjonister(saksnummer, valg);
  };
  const betalingsvalgErFaktura = betalingsvalg === MKV.Koder.betalingstype.FAKTURA;
  const visFakturaMottaker = betalingsvalgErFaktura && fakturamottaker !== undefined;

  const getVedtakstype = () => {
    if (lagretVedtakstype) return lagretVedtakstype;
    if (erNyVurdering) return ENDRINGSVEDTAK;
    return FØRSTEGANGSVEDTAK;
  };

  async function kontroller(data: any) {
    if (data.aktivtSteg && redigerbart && data.mottatteOpplysningerStatus === "OK") {
      setVedtakPending(true);
      const request = {
        behandlingID,
        vedtakstype: getVedtakstype(),
        behandlingsresultattype: FASTSATT_TRYGDEAVGIFT,
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

    return () => {
      dispatch(kontrollOperations.resetKontrollFeil());
    };
  }, [aktivtSteg, redigerbart, mottatteOpplysningerStatus]);

  const onSubmit = () => {
    setVedtakPending(true);
    const { FASTSATT_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingsresultattyper;

    Api.Saksflyt.Trygdeavgift.iverksettPensjonist(behandlingID, {
      behandlingsresultatTypeKode: FASTSATT_TRYGDEAVGIFT,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
    })
      .then(() => {
        setVedtakPending(false);
        dispatch(tilForsiden());
      })
      .catch((err) => {
        if (err) setVedtakPending(false);
      });
  };

  return (
    <div className="vurderingBekreftelse">
      <Nav.Heading level="1" className="stegvelgertittel">
        Bekreft opplysninger
      </Nav.Heading>
      <Nav.BodyLong size="small">{trygdeavgiftMottaker?.term} </Nav.BodyLong>
      {mottakerErNav && (
        <Nav.HStack className="betalingsvalg">
          <Betalingsvalg
            skalSendeFaktura={betalingsvalgErFaktura}
            onBetalingsvalgChange={oppdaterBetalingsvalg}
            redigerbart={erRedigerbarBetalingsvalg}
          />
        </Nav.HStack>
      )}
      {visFakturaMottaker && (
        <Nav.HStack className="fakturamottaker">
          <Nav.BodyLong size="small" className="info">
            Faktura sendes til {fullmektigErFakturamottaker ? "fullmektig" : ""}: &nbsp;
          </Nav.BodyLong>

          <Nav.BodyLong size="small" className="bold">
            {fakturamottaker}
          </Nav.BodyLong>
        </Nav.HStack>
      )}
      {redigerbart && visFakturaMottaker && fullmektigErFakturamottaker ? (
        <FullmaktForTrygdeavgiftConfirmationPanel
          harBekreftet={harBekreftetFullmaktForTrygdeavgift}
          onChange={setHarBekreftetFullmaktForTrygdeavgift}
        />
      ) : null}
      <Forms.HtmlEditor
        name="begrunnelseFritekst"
        control={control}
        className="fritekst_editor"
        disabled={!redigerbart}
        label="Fritekst"
      />
      <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} />
      <Mui.StegKnapper
        bekreftTekst="Bekreft og send orienteringsbrev til bruker"
        bekreftKnappProps={{
          disabled:
            !stegErGyldig ||
            !redigerbart ||
            !formIsValid ||
            (visFakturaMottaker && fullmektigErFakturamottaker && !harBekreftetFullmaktForTrygdeavgift),
          onClick: () => onSubmit(),
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}

export default VurderingBekreftelse;
