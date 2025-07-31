import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import MKV from "../../../../../melosyskodeverk";
import * as Forms from "../../../../../felleskomponenter/forms";
import "./vurderingBekreftelse.css";
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
const { TRYGDEAVGIFT_BETALES_TIL_NAV } = MKV.Koder.trygdeavgiftmottaker;
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

function VurderingBekreftelse({ tilbake, aktivtSteg }: Props) {
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector);
  const dispatch = useDispatch();
  const [betalingsvalg, setBetalingsvalg] = useState(MKV.Koder.betalingstype.TREKK);
  const [pdfDokumenter, setPdfDokumenter] = useState<PdfDokumentData[]>([]);
  const [vedtakPending, setVedtakPending] = useState(false);
  const [trygdeavgiftMottaker, setTrygdeavgiftMottaker] = useState<KTObject | undefined>(undefined);
  const mottakerErNav = trygdeavgiftMottaker?.kode === TRYGDEAVGIFT_BETALES_TIL_NAV;

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
    }
  }, [aktivtSteg]);

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
                fullmektig.fullmakter?.includes(MKV.Koder.fullmaktstype.FULLMEKTIG_SØKNAD),
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
            redigerbart={redigerbart}
          />
        </Nav.HStack>
      )}

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
          disabled: !redigerbart || !formIsValid,
          onClick: () => onSubmit(),
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}

export default VurderingBekreftelse;
