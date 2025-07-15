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
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import vurdering_bekreftelse from "./vurderingBekreftelseSchema";
import { Betalingsvalg } from "../../../../ftrl/saksbehandling/stegKomponenter/vurderingVedtak/betalingsvalg/betalingsvalg";
import { useCallback, useEffect, useState } from "react";
import { fagsakSelectors } from "../../../../../ducks/fagsaker";
import { useDispatch } from "../../../../../hooks";
import { vedtakOperations } from "../../../../../ducks/vedtak";
import { iverksettPensjonist, IverksettReqDto } from "../../../../../services/modules/saksflyt/trygdeavgift";
import { tilForsiden } from "../../../../../ducks/navigering/operations";

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

function VurderingBekreftelse() {
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector);
  const dispatch = useDispatch();
  const [betalingsvalg, setBetalingsvalg] = useState(MKV.Koder.betalingstype.TREKK);
  const [pdfDokumenter, setPdfDokumenter] = useState<PdfDokumentData[]>([]);
  const [vedtakPending, setVedtakPending] = useState(false);

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
    if (saksnummer) {
      hentPdfDokumenter();
      hentBetalingsvalg();
    }
  }, [saksnummer]);

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

  const onSubmit = async () => {
    setVedtakPending(true);
    const { FASTSATT_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingsresultattyper;

    Api.Saksflyt.Trygdeavgift.iverksettPensjonist(behandlingID, {
      behandlingsresultatTypeKode: FASTSATT_TRYGDEAVGIFT,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
    })
      .then(() => {
        setVedtakPending(false);
        tilForsiden();
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
      <Nav.BodyLong size="small">Trygdeavgift skal betales til ...</Nav.BodyLong>
      <Nav.Row>
        <Betalingsvalg
          skalSendeFaktura={betalingsvalgErFaktura}
          onBetalingsvalgChange={oppdaterBetalingsvalg}
          redigerbart={redigerbart}
        />
      </Nav.Row>

      <Forms.HtmlEditor
        name="begrunnelseFritekst"
        control={control}
        className="fritekst_editor"
        disabled={!redigerbart}
      />
      <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} />
      <Mui.StegKnapper
        bekreftTekst="Bekreft og send orienteringsbrev til bruker"
        bekreftKnappProps={{
          disabled: !redigerbart || !formIsValid,
          onClick: async () => await onSubmit(),
        }}
      />
    </div>
  );
}

export default VurderingBekreftelse;
