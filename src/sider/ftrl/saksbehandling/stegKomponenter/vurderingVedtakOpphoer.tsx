import * as Nav from "../../../../navFrontend";
import "./vurderingVedtak.css";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { useDispatch, useSelector } from "react-redux";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import vurdering_vedtak_opphoer from "./vurderingVedtakOpphoerSchema";
import * as Api from "../../../../services/api";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { useCallback, useEffect, useState } from "react";
import Dokumentliste from "../../../../felleskomponenter/dokumentliste";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Utils from "../../../../utils";
import * as Mui from "../../../../felleskomponenter/ui";
import MKV from "../../../../melosyskodeverk";
import { vedtakOperations } from "../../../../ducks/vedtak";

const { OPPHOERT_MEDLEMSKAP } = MKV.Koder.brev.produserbaredokumenter;

interface FormValuesProps {
  begrunnelseFritekst?: string;
}

interface Props {
  tilbake: () => void;
  aktivtSteg: boolean;
}

export const VurderingVedtakOpphoer = ({ tilbake, aktivtSteg }: Props) => {
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const dispatch = useDispatch();
  const [vedtakPending, setVedtakPending] = useState(false);
  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());

  const {
    watch,
    control,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurdering_vedtak_opphoer),
    defaultValues: {
      begrunnelseFritekst: useSelector(behandlingsresultatSelectors.BegrunnelseFritekstSelector) || "",
    } as FieldValues,
  });

  const formValues = watch();

  const oppdaterFritekster = (values: FormValuesProps) => {
    if (values && redigerbart && !vedtakPending) {
      Api.Behandlinger.resultat.oppdaterFritekster(behandlingID, {
        begrunnelseFritekst: values.begrunnelseFritekst,
      });
    }
  };
  const debouncedOppdaterFritekster = useCallback(Utils._debounce(oppdaterFritekster, 1000), []);

  useEffect(() => {
    debouncedOppdaterFritekster(formValues);
  }, [formValues?.begrunnelseFritekst]);

  const hentMuligeMottakere = async () => {
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: OPPHOERT_MEDLEMSKAP,
      orgnr: null,
    });
    setMuligeMottakere(res);
  };

  useEffect(() => {
    hentMuligeMottakere();
    return () => debouncedOppdaterFritekster.cancel();
  }, []);

  const lagFattVedtakFTRLReqDto = () => {
    return {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.HENLEGGELSE,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      vedtakstype,
      kopiMottakere: muligeMottakere.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
    };
  };

  const mapMottakerRad = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return {
      dokumentData: {
        produserbardokument: OPPHOERT_MEDLEMSKAP,
        mottaker: muligMottaker.rolle,
        begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
        orgNr: muligMottaker?.orgnr || null,
      },
      mottakerNavn: muligMottaker.mottakerNavn,
    };
  };

  const mapMottakerRader = (mottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return [
      mapMottakerRad(mottakere.hovedMottaker),
      ...mottakere.kopiMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker)),
      ...mottakere.fasteMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker)),
    ];
  };

  const onSubmit = async () => {
    setVedtakPending(true);
    dispatch(vedtakOperations.fatt(behandlingID, lagFattVedtakFTRLReqDto()));
    /* TODO: Fiks typescript issue med useDispatch og thunks og flytt settVedtakPending(false) inn dersom api kallet feiler
    https://stackoverflow.com/questions/66486348/dispatch-is-not-returning-a-promise-using-redux-thunk-with-typescript
    */
    setVedtakPending(false);
  };

  const stegErGyldig = redigerbart && formIsValid;

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingVedtak">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Opphør av frivillig medlemskap etter § 2-15
      </Nav.Typo.Innholdstittel>
      <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
        <LabelMedHjelpetekst
          label="Fritekst til begrunnelse"
          hjelpetekst="begrunnelseFritekstHjelpetekst"
          hjelpetekstClassName="hjelpetekst"
        />
      </Nav.Typo.Element>
      <Forms.HtmlEditor
        name="begrunnelseFritekst"
        control={control}
        className="fritekst_editor"
        disabled={!redigerbart}
      />
      {stegErGyldig && muligeMottakere && (
        <Dokumentliste behandlingID={behandlingID} dokumenter={mapMottakerRader(muligeMottakere)} />
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: onSubmit,
          disabled: !stegErGyldig,
          autoDisableVedSpinner: true,
          spinner: vedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
