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
  const medlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
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
      produserbartdokument: VEDTAK_OPPHOERT_MEDLEMSKAP,
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
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.OPPHØRT,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      kopiMottakere: muligeMottakere.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
    };
  };
  const mapMottakerRad = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return {
      dokumentData: {
        produserbardokument: VEDTAK_OPPHOERT_MEDLEMSKAP,
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

  function mapPeriodeRader(perioder: Api.MedlemAvFolketrygden.Medlemskapsperioder.Medlemskapsperiode[] | undefined) {
    const sortertePerioder = perioder
      ? [...perioder]
          .filter((periode) => periode.innvilgelsesResultat === INNVILGET)
          .sort(Utils.dato.sorterEtterISOFomDato)
      : [];
    return sortertePerioder.map((medlemskapsperiode) => {
      return {
        periode: `${Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(
          medlemskapsperiode.tomDato
        )}`,
        resultat: KV.finnTermFraListe(MKV.KTObjects.innvilgelsesResultat, OPPHØRT),
      };
    });
  }

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingVedtakOpphoer">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Opphør av frivillig medlemskap etter § 2-15
      </Nav.Typo.Innholdstittel>

      <Table size="small" className="melosys__table">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
            <Table.HeaderCell scope="col">Resultat</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {mapPeriodeRader(medlemskapsperioder).map((rad) => {
            return (
              <Table.Row key={Utils._uuid()}>
                <Table.DataCell>{rad.periode}</Table.DataCell>
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
          autoDisableVedSpinner: true,
          spinner: vedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
