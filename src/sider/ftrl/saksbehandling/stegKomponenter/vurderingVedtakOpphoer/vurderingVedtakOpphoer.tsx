import * as Nav from "../../../../../navFrontend";
import "./vurderingVedtakOpphoer.css";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { useDispatch, useSelector } from "react-redux";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import vurdering_vedtak_opphoer from "./vurderingVedtakOpphoerSchema";
import * as Api from "../../../../../services/api";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { useCallback, useEffect, useState } from "react";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as Utils from "../../../../../utils";
import * as Mui from "../../../../../felleskomponenter/ui";
import MKV from "../../../../../melosyskodeverk";
import { vedtakOperations } from "../../../../../ducks/vedtak";
import Dokumentliste from "../../../../../felleskomponenter/dokumentliste";
import { Table } from "@navikt/ds-react";
import { medlemskapsperioderSelectors } from "../../../../../ducks/medlemskapsperioder";
import * as KV from "../../../../../kodeverk";

const { VEDTAK_OPPHOERT_MEDLEMSKAP } = MKV.Koder.brev.produserbaredokumenter;
const { OPPHØRT, INNVILGET } = MKV.Koder.innvilgelsesResultat;
const { FTRL_KAP2_2_15_ANDRE_LEDD } = MKV.Koder.folketrygdloven_kap2_bestemmelser;
const { AVSLUTTET } = MKV.Koder.behandlinger.behandlingsstatus;

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
  const lagretVedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const medlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const behandlingErAvsluttet = useSelector(behandlingerSelectors.BehandlingsstatusKodeSelector) === AVSLUTTET;
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
  const stegErGyldig = redigerbart && formIsValid;

  const hentMuligeMottakere = async () => {
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: VEDTAK_OPPHOERT_MEDLEMSKAP,
      orgnr: null,
    });
    setMuligeMottakere(res);
  };

  useEffect(() => {
    hentMuligeMottakere();
    return () => debouncedOppdaterFritekster.cancel();
  }, []);

  const forventetOpphørteMedlemskapsperioder = () =>
    behandlingErAvsluttet
      ? [...medlemskapsperioder]
      : [...medlemskapsperioder]
          .filter((it) => [INNVILGET, OPPHØRT].includes(it.innvilgelsesResultat))
          .map((it) => {
            return { ...it, innvilgelsesResultat: OPPHØRT, bestemmelse: FTRL_KAP2_2_15_ANDRE_LEDD };
          });

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

  const getOpphørsdato = () =>
    forventetOpphørteMedlemskapsperioder()
      .sort(Utils.dato.sorterEtterISOFomDato)
      .find((periode) => periode.innvilgelsesResultat === OPPHØRT)?.fomDato;

  const lagFattVedtakFTRLReqDto = (): Api.Saksflyt.Vedtak.FattVedtakFTRLReqDto => {
    return {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.OPPHØRT,
      vedtakstype: lagretVedtakstype || MKV.Koder.vedtakstyper.OPPHØRSVEDTAK,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      kopiMottakere: muligeMottakere.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
      opphoerDato: getOpphørsdato(),
    };
  };

  const onSubmit = async () => {
    setVedtakPending(true);
    dispatch(vedtakOperations.fatt(behandlingID, lagFattVedtakFTRLReqDto()));
    /* TODO: Fiks typescript issue med useDispatch og thunks og flytt settVedtakPending(false) inn dersom api kallet feiler
    https://stackoverflow.com/questions/66486348/dispatch-is-not-returning-a-promise-using-redux-thunk-with-typescript
    */
    setVedtakPending(false);
  };

  if (!aktivtSteg) return null;

  const mapMottakerRad = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return {
      dokumentData: {
        produserbardokument: VEDTAK_OPPHOERT_MEDLEMSKAP,
        mottaker: muligMottaker.rolle,
        begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
        orgNr: muligMottaker?.orgnr || null,
        opphoerDato: getOpphørsdato(),
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

  const mapPeriodeRader = (perioder: Api.MedlemAvFolketrygden.Medlemskapsperioder.Medlemskapsperiode[]) =>
    perioder.sort(Utils.dato.sorterEtterISOFomDato).map((it) => {
      return {
        periode: `${Utils.dato.formatterDatoTilNorsk(it.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(it.tomDato)}`,
        bestemmelse: KV.finnTermFraListe(MKV.KTObjects.folketrygdloven_kap2_bestemmelser, it.bestemmelse),
        resultat: KV.finnTermFraListe(MKV.KTObjects.innvilgelsesResultat, it.innvilgelsesResultat),
      };
    });

  return (
    <div className="vurderingVedtakOpphoer">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Opphør av frivillig medlemskap etter § 2-15
      </Nav.Typo.Innholdstittel>

      <Table size="small" className="melosys__table">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
            <Table.HeaderCell scope="col">Bestemmelse</Table.HeaderCell>
            <Table.HeaderCell scope="col">Resultat</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {mapPeriodeRader(forventetOpphørteMedlemskapsperioder()).map((rad) => {
            return (
              <Table.Row key={Utils._uuid()}>
                <Table.DataCell>{rad.periode}</Table.DataCell>
                <Table.DataCell>{rad.bestemmelse}</Table.DataCell>
                <Table.DataCell>{rad.resultat}</Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
        Fritekst til begrunnelse
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
          loading: vedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
