import { Fragment, useCallback, useEffect, useState } from "react";
import { connect, ConnectedProps, useDispatch, useSelector } from "react-redux";
import { getFormValues, InjectedFormProps, isValid, reduxForm } from "redux-form";
import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Utils from "../../../../utils";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { anmodningsperiodesvarSelectors } from "../../../../ducks/anmodningsperiodesvar";
import { anmodningsperioderSelectors } from "../../../../ducks/anmodningsperioder";
import { vilkarSelectors } from "../../../../ducks/vilkar";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { vedtakOperations } from "../../../../ducks/vedtak";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import VurderingArtikkel16VedtakSchema from "./vurderingArtikkel16VedtakSchema";
import "./vurderingArtikkel16Vedtak.css";
import Innvilgelse from "./komponenter/innvilgelse";
import DelvisInnvilgelse from "./komponenter/delvisInnvilgelse";
import { Avslag } from "./komponenter/avslag";
import VedtakBegrunnelser from "./komponenter/vedtakBegrunnelser";
import { AnmodningsperiodesvarResDto } from "../../../../services/modules/anmodningsperioder/svar/svar";
import { Anmodningsperiode } from "../../../../services/modules/anmodningsperioder";
import { RootState } from "AppTypes";
import { erLovvalgsperiodeForkortet, hentLovvalgsperiode } from "./komponenter/utils";
import { kontrollOperations } from "../../../../ducks/kontroll";
import { flytSelectors } from "../../../../ducks/flyt";

const { INNVILGELSE, DELVIS_INNVILGELSE, AVSLAG } = MKV.Koder.anmodningsperiodesvartyper;
const { FØRSTEGANGSVEDTAK } = MKV.Koder.vedtakstyper;
const { FASTSATT_LOVVALGSLAND } = MKV.Koder.behandlinger.behandlingsresultattyper;

export interface FormValuesProps {
  forkortLovvalgsperiode: boolean;
  tomDato: string;
  fomDato: string;
  vedtakstypebegrunnelse: string | undefined;
  vedtakstype: string | undefined;
  vedtaksbrevFritekst: string | undefined;
}

const mapStateToProps = (state: RootState) => {
  const forkortLovvalgsperiode = erLovvalgsperiodeForkortet(state);
  return {
    behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
    lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
    anmodningsperiode: anmodningsperioderSelectors.AnmodningsperiodeSelector(state),
    anmodningsperiodesvar: anmodningsperiodesvarSelectors.AnmodningsperiodesvarSelector(state),
    formValues: getFormValues(KV.Form.ARTIKKEL_16_1_VEDTAK)(state) as FormValuesProps,
    initialValues: {
      forkortLovvalgsperiode,
      fomDato: forkortLovvalgsperiode
        ? Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.FomDatoSelector(state))
        : "",
      tomDato: forkortLovvalgsperiode
        ? Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state))
        : "",
      vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
      vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
      vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
    },
  };
};

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type VurderingArtikkel16VedtakProps = PropsFromRedux & {
  anmodningsperiodesvar: AnmodningsperiodesvarResDto;
  anmodningsperiode: Anmodningsperiode;
  behandlingstype: string;
  formValues: FormValuesProps;
  tilbake: () => void;
  redigerbart: boolean;
  harFeilmeldinger: boolean;
  aktivtSteg: boolean | undefined;
  validerMottatteOpplysninger: () => Promise<void>;
};

export const VurderingArtikkel16Vedtak = ({
  redigerbart,
  anmodningsperiode,
  anmodningsperiodesvar,
  formValues,
  behandlingstype,
  touch,
  tilbake,
  harFeilmeldinger,
  aktivtSteg = false,
  validerMottatteOpplysninger,
}: VurderingArtikkel16VedtakProps & InjectedFormProps<FormValuesProps, VurderingArtikkel16VedtakProps>) => {
  const dispatch = useDispatch();
  const [vedtakPending, setVedtakPending] = useState(false);
  let oppdaterFørKontroll = true;

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const vilkarBegrunnelser = useSelector(vilkarSelectors.vilkarBegrunnelserSelector);
  const art_12_1_begrunnelser = useSelector(vilkarSelectors.art12_1_begrunnelserSelector);
  const art_12_2_begrunnelser = useSelector(vilkarSelectors.art12_2_begrunnelserSelector);
  const mottatteOpplysningerStatus = useSelector(mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector);
  const harValgtNorskArbeidsgiver = useSelector(flytSelectors.HarValgtNorskArbeidsgiverSelector);
  const formIsValid = useSelector(isValid(KV.Form.ARTIKKEL_16_1_VEDTAK));
  const endreLovvalgsperiode = (fomdato?: string | null, tomdato?: string | null) =>
    dispatch(lovvalgsperioderOperations.endreLovvalgsPeriode(fomdato ?? "", tomdato ?? undefined));

  useEffect(() => {
    /**
     * Backend tar ansvar for å opprette en lovvalgsperiode ved POST av anmodningsperiodeSvar, med periode enten fra anmodningsperiode(ved innvilgelse eller avslag), eller fra anmodningsperiodeSvar(ved delvis innvilgelse). Henter denne ned her.
     */
    dispatch(lovvalgsperioderOperations.hent(behandlingID));
  }, [anmodningsperiodesvar]);

  async function kontroller(data: {
    aktivtSteg: boolean;
    mottatteOpplysningerStatus: string;
    formIsValid: boolean;
    formValues: FormValuesProps;
  }) {
    if (redigerbart && data.mottatteOpplysningerStatus === "OK" && data.aktivtSteg && data.formIsValid) {
      setVedtakPending(true);
      const request = {
        behandlingID,
        vedtakstype: data.formValues.vedtakstype || FØRSTEGANGSVEDTAK,
        behandlingsresultattype: FASTSATT_LOVVALGSLAND,
        skalRegisteropplysningerOppdateres: oppdaterFørKontroll,
      };
      oppdaterFørKontroll = false;
      await dispatch(kontrollOperations.kontrollerFerdigbehandling(request));
      setVedtakPending(false);
    }
  }

  const debouncedKontrollerBehandling = useCallback(Utils._debounce(kontroller, 500), []);

  useEffect(() => {
    debouncedKontrollerBehandling({ aktivtSteg, formValues, mottatteOpplysningerStatus, formIsValid });
  }, [aktivtSteg, formIsValid, mottatteOpplysningerStatus]);

  const validerForm = () => {
    touch("vedtakstype");
    touch("vedtakstypebegrunnelse");
    touch("fomDato");
    touch("tomDato");
    return formIsValid;
  };

  const forkortLovvalgsperiode = () =>
    endreLovvalgsperiode(
      Utils.dato.formatterDatoTilISO(formValues.fomDato),
      Utils.dato.formatterDatoTilISO(formValues.tomDato)
    );

  const vedKlikkForhandsvis = async () => {
    if (!validerForm()) return false;

    if (formValues.forkortLovvalgsperiode) {
      await forkortLovvalgsperiode();
    }

    await dispatch(lovvalgsperioderOperations.lagre());

    return true;
  };

  const vedKlikk = async () => {
    if (!validerForm()) return;

    if (formValues.forkortLovvalgsperiode) {
      await forkortLovvalgsperiode();
    }

    setVedtakPending(true);

    validerMottatteOpplysninger()
      .then(() => {
        const request = {
          behandlingsresultatTypeKode: FASTSATT_LOVVALGSLAND,
          fritekst: formValues.vedtaksbrevFritekst,
          fritekstSed: null,
          mottakerinstitusjoner: null,
          vedtakstype: formValues.vedtakstype || FØRSTEGANGSVEDTAK,
          nyVurderingBakgrunn: formValues.vedtakstypebegrunnelse,
        };
        // @ts-ignore
        dispatch(vedtakOperations.fatt(behandlingID, request)).then((res) => {
          if (res.data?.data?.error) {
            setVedtakPending(false);
          }
        });
      })
      .catch(() => setVedtakPending(false));
  };

  const { anmodningsperiodeSvarType } = anmodningsperiodesvar;

  const renderBegrunnelser = useCallback(
    () => (
      <VedtakBegrunnelser
        art12_1_begrunnelser={art_12_1_begrunnelser}
        art12_2_begrunnelser={art_12_2_begrunnelser}
        vilkarBegrunnelser={vilkarBegrunnelser}
        anmodningsperiodeSvarType={anmodningsperiodeSvarType}
      />
    ),
    [art_12_1_begrunnelser, art_12_2_begrunnelser, vilkarBegrunnelser, anmodningsperiodeSvarType]
  );

  const renderFritekstFelt = useCallback(
    () => (
      <Skjema.Textarea
        feltNavn="vedtaksbrevFritekst"
        label="Fritekst til vedtaksbrev"
        placeholder="Skriv inn tekst til vedtaksbrevet..."
        disabled={!redigerbart}
      />
    ),
    [formValues?.vedtaksbrevFritekst, redigerbart]
  );

  if (!formValues) return null;

  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const visOrienteringsbrevArbeidsgiver = harValgtNorskArbeidsgiver && !erNyVurdering;
  const gjeldendePeriode = hentLovvalgsperiode(anmodningsperiodesvar, anmodningsperiode);
  const gjenopprettUforkortetPeriode = () => endreLovvalgsperiode(gjeldendePeriode.fom, gjeldendePeriode.tom);

  const finnVedtakInnhold = (svarType: string | null, stegErGyldig: boolean) => {
    switch (svarType) {
      case INNVILGELSE:
        return (
          <Innvilgelse
            redigerbart={redigerbart}
            behandlingID={behandlingID}
            renderFritekstFelt={renderFritekstFelt}
            vedtaksbrevFritekst={formValues.vedtaksbrevFritekst}
            gjeldendePeriode={gjeldendePeriode}
            visOrienteringsbrevArbeidsgiver={visOrienteringsbrevArbeidsgiver}
            onPeriodeForkorterUncheck={gjenopprettUforkortetPeriode}
            formValues={formValues}
            vedKlikkForhandsvis={vedKlikkForhandsvis}
            stegErGyldig={stegErGyldig}
            lovvalgsbestemmelse={anmodningsperiode.lovvalgBestemmelse}
          />
        );
      case DELVIS_INNVILGELSE:
        return (
          <DelvisInnvilgelse
            redigerbart={redigerbart}
            behandlingID={behandlingID}
            renderFritekstFelt={renderFritekstFelt}
            vedtaksbrevFritekst={formValues.vedtaksbrevFritekst}
            gjeldendePeriode={gjeldendePeriode}
            renderBegrunnelser={renderBegrunnelser}
            visOrienteringsbrevArbeidsgiver={visOrienteringsbrevArbeidsgiver}
            onPeriodeForkorterUncheck={gjenopprettUforkortetPeriode}
            formValues={formValues}
            vedKlikkForhandsvis={vedKlikkForhandsvis}
            stegErGyldig={stegErGyldig}
            lovvalgsbestemmelse={anmodningsperiode.lovvalgBestemmelse}
          />
        );
      case AVSLAG:
        return (
          <Avslag
            redigerbart={redigerbart}
            behandlingID={behandlingID}
            renderFritekstFelt={renderFritekstFelt}
            vedtaksbrevFritekst={formValues.vedtaksbrevFritekst}
            renderBegrunnelser={renderBegrunnelser}
            visOrienteringsbrevArbeidsgiver={visOrienteringsbrevArbeidsgiver}
          />
        );
      default:
        throw new Error(`AnmodningsperiodeSvarType ${svarType} er ugyldig`);
    }
  };

  const stegErGyldig = redigerbart && formIsValid && (!harFeilmeldinger || anmodningsperiodeSvarType === AVSLAG);
  const vedtakInnhold = finnVedtakInnhold(anmodningsperiodeSvarType, stegErGyldig);

  return (
    <Fragment>
      {vedtakInnhold}
      <Nav.Row>
        <Nav.Column xs="7" className="fane__fot">
          {erNyVurdering && <Skjema.Vedtakstype redigerbart={redigerbart} className="vedtakstype" />}
          {erNyVurdering && redigerbart && (
            <Nav.Alert variant="info">{KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}</Nav.Alert>
          )}
          <Mui.StegKnapper
            bekreftKnappProps={{
              loading: vedtakPending,
              disabled: !stegErGyldig,
              onClick: vedKlikk,
            }}
            bekreftTekst="Fatt vedtak"
            tilbakeKnappProps={{
              onClick: tilbake,
              disabled: !redigerbart,
            }}
          />
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

const VurderingArtikkel16VedtakForm = reduxForm<FormValuesProps, VurderingArtikkel16VedtakProps>({
  form: KV.Form.ARTIKKEL_16_1_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(VurderingArtikkel16VedtakSchema, {
      context: {
        behandlingstype: props.behandlingstype,
        lovvalgsperiode: hentLovvalgsperiode(props.anmodningsperiodesvar, props.anmodningsperiode),
      },
    })(values),
})(VurderingArtikkel16Vedtak);

export default connector(VurderingArtikkel16VedtakForm);
