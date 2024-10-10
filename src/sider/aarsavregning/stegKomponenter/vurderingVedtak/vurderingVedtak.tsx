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

const { FERDIGBEHANDLET } = MKV.Koder.behandlinger.behandlingsresultattyper;
const { FØRSTEGANGSVEDTAK } = MKV.Koder.vedtakstyper;
const { AARSAVREGNING_VEDTAKSBREV } = MKV.Koder.brev.produserbaredokumenter;

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

export const VurderingVedtak = ({ tilbake, aktivtSteg }: Props) => {
  const dispatch = useDispatch();
  const [vedtakPending, setVedtakPending] = useState<boolean>(false);
  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());
  const [lagretAarsavregning, setLagretAarsavregning] = useState<AarsavregningResponse | undefined>(undefined);
  const [fakturaMottaker, setFakturaMottaker] = useState<string | undefined>(undefined);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);

  const { fattVedtak } = komponentDispatch(dispatch);

  const {
    watch,
    control,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurdering_vedtak),
    defaultValues: {
      begrunnelseFritekst: useSelector(behandlingsresultatSelectors.BegrunnelseFritekstSelector) || "",
      innledningFritekst: useSelector(behandlingsresultatSelectors.InnledningFritekstSelector) || "",
    } as FieldValues,
  });
  const formValues = watch();

  const fetchAvregningsData = () => {
    return Api.Aarsavregning.hentAarsavregning(behandlingID).then((response: AarsavregningResponse) => {
      setLagretAarsavregning(response);
    });
  };

  const hentMuligeMottakere = async () => {
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: AARSAVREGNING_VEDTAKSBREV,
      orgnr: null,
    });
    setMuligeMottakere(res);
  };

  useEffect(() => {
    if (aktivtSteg) {
      fetchAvregningsData();
      hentMuligeMottakere();

      Api.Trygdeavgift.hentFakturamottaker(behandlingID).then((dto) => {
        setFakturaMottaker(dto.navn);
      });
    }
  }, [aktivtSteg]);

  const lagFattVedtakReqDto = (): Api.Saksflyt.Vedtak.FattVedtakÅrsavregningReqDto => {
    return {
      behandlingsresultatTypeKode: FERDIGBEHANDLET,
      innledningFritekst: formValues?.innledningFritekst || null,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      vedtakstype: FØRSTEGANGSVEDTAK,
      kopiMottakere: muligeMottakere.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
    };
  };

  const fattVedtakOnClick = async () => {
    setVedtakPending(true);
    fattVedtak(behandlingID, lagFattVedtakReqDto()).then((res) => {
      if (res.data?.data?.error) {
        setVedtakPending(false);
      }
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
  const debouncedOppdaterFritekster = useCallback(Utils._debounce(oppdaterFritekster, 1000), []);

  useEffect(() => {
    debouncedOppdaterFritekster(formValues);
  }, [formValues?.innledningFritekst, formValues?.begrunnelseFritekst, formValues?.trygdeavgiftFritekst]);

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

  const stegErGyldig = formIsValid;

  const tidligereTrygdeavgift = lagretAarsavregning?.tidligereGrunnlagsopplysninger?.avgift.totalAvgift;
  const nyTrygdeavgift = lagretAarsavregning?.nyttGrunnlag?.avgift.totalAvgift;

  const erDifferanseUnderMinstebeløp =
    tidligereTrygdeavgift &&
    nyTrygdeavgift &&
    Math.abs(tidligereTrygdeavgift - nyTrygdeavgift) < MINSTEBELOP_FAKTURERING_ELLER_REFUSJON;

  const skalFaktureres = tidligereTrygdeavgift && nyTrygdeavgift && nyTrygdeavgift - tidligereTrygdeavgift > 0;

  return (
    <div className="vurderingVedtak">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Vedtak årsavregning {lagretAarsavregning ? lagretAarsavregning.aar : ""}
      </Nav.Typo.Innholdstittel>

      <SumArsavregningTabell nyTrygdeavgift={nyTrygdeavgift} tidligereTrygdeavgift={tidligereTrygdeavgift} />

      {fakturaMottaker && nyTrygdeavgift ? (
        <Nav.Row className="trygdeavgift">
          <Nav.Column xs="12">
            <Nav.Typo.Normaltekst className="info">
              {erDifferanseUnderMinstebeløp ? (
                <b>Beløpet er under minstegrensen for fakturering/refusjon (100kr).</b>
              ) : (
                <>
                  {`${skalFaktureres ? "Faktura" : "Kreditnota"} på kr ${
                    Utils.formaterTilNorskBelop(
                      Math.abs((nyTrygdeavgift || tidligereTrygdeavgift || 0) - (tidligereTrygdeavgift || 0))
                    ) || "0"
                  } sendes til: `}{" "}
                  <b>{fakturaMottaker}</b>
                </>
              )}
            </Nav.Typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>
      ) : null}

      <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
        <LabelMedHjelpetekst label="Fritekst til innledning" hjelpetekst="" />
      </Nav.Typo.Element>
      <Forms.HtmlEditor
        name="innledningFritekst"
        control={control}
        className="fritekst_editor"
        disabled={!redigerbart}
      />

      <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
        <LabelMedHjelpetekst label="Fritekst til begrunnelse" hjelpetekst="" />
      </Nav.Typo.Element>
      <Forms.HtmlEditor
        name="begrunnelseFritekst"
        control={control}
        className="fritekst_editor"
        disabled={!redigerbart}
      />

      {stegErGyldig && redigerbart && muligeMottakere && (
        <Dokumentliste behandlingID={behandlingID} dokumenter={mapMottakerRader(muligeMottakere)} />
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: fattVedtakOnClick,
          disabled: !stegErGyldig || !formIsValid || !redigerbart,
          loading: vedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
