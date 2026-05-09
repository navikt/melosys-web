import { useCallback, useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { getFormValues, isValid, reduxForm } from "redux-form";
import PT from "prop-types";
import MKV from "../../../melosyskodeverk";

import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Mui from "../../../felleskomponenter/ui";
import * as Utils from "../../../utils";

import { vilkarSelectors } from "../../../ducks/vilkar";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { kontrollerFerdigbehandling } from "../../../ducks/kontroll/operations";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { vedtakOperations } from "../../../ducks/vedtak";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import Begrunnelser from "../../../felleskomponenter/begrunnelser";
import Dokumentliste from "../../../felleskomponenter/dokumentliste";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import VurderingAvslagArtikkel12Og16Schema from "./vurderingAvslag12_x_og_16Schema";
import { VurderingYrkesaktivitetTyper } from "../../../kodeverk/koder";
import { avklartefaktaSelectors } from "../../../ducks/avklartefakta";

const skalViseSendOrienteringsbrev = (sakstype, behandlingstema, erNyVurdering, erSelvstendigNaeringsdrivende) =>
  !erNyVurdering &&
  !erSelvstendigNaeringsdrivende &&
  sakstype === MKV.Koder.sakstyper.EU_EOS &&
  [
    MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
    MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
  ].includes(behandlingstema);

function VurderingAvslag12_x_og_16({
  valgte_utsendt_arbeidstaker_begrunnelser,
  valgte_utsendt_naeringsdrivende_begrunnelser,
  valgte_art_16_1_begrunnelser,
  art16_1_fritekst = "",
  vilkarBegrunnelser,
  behandlingID,
  redigerbart = true,
  harFeilmeldinger,
  behandlingstype,
  behandlingstema,
  touch,
  sakstype,
  formIsValid,
  formValues = {},
  tilbake,
  validerMottatteOpplysninger,
  mottatteOpplysningerStatus,
  aktivtSteg = false,
}) {
  const [vedtakPending, setVedtakPending] = useState(false);
  const erSelvstendigNaeringsdrivende =
    useSelector(avklartefaktaSelectors.YrkesaktivitetSelector) ===
    VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE;
  const dispatch = useDispatch();

  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const pdfDokumenter = [
    {
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        fritekst: formValues.vedtaksbrevFritekst,
      },
    },
  ];

  const { kopiTilArbeidsgiver, vedtakstype } = formValues;
  if (!erNyVurdering && kopiTilArbeidsgiver && !erSelvstendigNaeringsdrivende) {
    pdfDokumenter.push({
      navn: "Orientering til arbeidsgiver om vedtak",
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
        erInnvilgelse: false,
        mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
      },
    });
  } else if (!erNyVurdering && kopiTilArbeidsgiver) {
    pdfDokumenter.push({
      navn: "Orientering til arbeidsgiver om avslag",
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_ARBEIDSGIVER,
        mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
      },
    });
  }

  const muligeVirksomhetBegrunnelser = [
    ...MKV.KTObjects.begrunnelser.normalt_virksomhet_begrunnelser,
    ...MKV.KTObjects.begrunnelser.vesentlig_virksomhet_begrunnelser,
    ...MKV.KTObjects.begrunnelser.forutgaaende_medl_begrunnelser,
    ...MKV.KTObjects.begrunnelser.bosted,
  ];

  const kontrollerBehandling = (data) => {
    if (redigerbart && data.aktivtSteg && data.mottatteOpplysningerStatus === "OK") {
      dispatch(
        kontrollerFerdigbehandling({
          behandlingID,
          vedtakstype: data.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
          behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
          kontrollerSomSkalIgnoreres: data.kopiTilArbeidsgiver
            ? []
            : [MKV.Koder.begrunnelser.kontroll_begrunnelser.OPPHØRT_ARBEIDSGIVER],
          skalRegisteropplysningerOppdateres: false,
        }),
      );
    }
  };
  const debouncedKontrollerBehandling = useCallback(Utils._debounce(kontrollerBehandling, 500), []);

  useEffect(() => {
    debouncedKontrollerBehandling({ aktivtSteg, mottatteOpplysningerStatus, kopiTilArbeidsgiver, vedtakstype });
  }, [kopiTilArbeidsgiver, mottatteOpplysningerStatus, aktivtSteg]);

  const validerForm = () => {
    touch("vedtakstype");
    touch("vedtakstypebegrunnelse");
    return formIsValid;
  };

  const avslaa = async () => {
    debouncedKontrollerBehandling.cancel?.();

    const { UTSENDT_ARBEIDSTAKER, UTSENDT_SELVSTENDIG } = MKV.Koder.behandlinger.behandlingstema;

    const { FASTSATT_LOVVALGSLAND, AVSLAG_SØKNAD } = MKV.Koder.behandlinger.behandlingsresultattyper;
    const behandlingsresultatTypeKode =
      behandlingstema === UTSENDT_ARBEIDSTAKER || behandlingstema === UTSENDT_SELVSTENDIG
        ? AVSLAG_SØKNAD
        : FASTSATT_LOVVALGSLAND;

    if (!validerForm()) return;

    setVedtakPending(true);

    validerMottatteOpplysninger()
      .then(() => {
        dispatch(
          vedtakOperations.fatt(behandlingID, {
            behandlingsresultatTypeKode,
            fritekst: formValues.vedtaksbrevFritekst,
            fritekstSed: null,
            kopiTilArbeidsgiver: formValues.kopiTilArbeidsgiver === undefined ? false : formValues.kopiTilArbeidsgiver,
            mottakerinstitusjoner: null,
            vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
            nyVurderingBakgrunn: formValues.vedtakstypebegrunnelse,
          }),
        ).then((res) => {
          if (res.data?.data?.error) {
            setVedtakPending(false);
          }
        });
      })
      .catch(() => setVedtakPending(false));
  };
  const stegErGyldig = redigerbart && formIsValid && !harFeilmeldinger;

  return (
    <div>
      <Nav.Heading level="1" className="stegvelgertittel">
        Avslag
      </Nav.Heading>
      {valgte_utsendt_arbeidstaker_begrunnelser.length > 0 && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12. nr. 1:"
          valgteBegrunnelser={[...valgte_utsendt_arbeidstaker_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[
            ...MKV.KTObjects.begrunnelser.utsendt_arbeidstaker_begrunnelser,
            ...muligeVirksomhetBegrunnelser,
          ]}
        />
      )}
      {valgte_utsendt_naeringsdrivende_begrunnelser.length > 0 && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12, nr. 2:"
          valgteBegrunnelser={[...valgte_utsendt_naeringsdrivende_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[
            ...MKV.KTObjects.begrunnelser.utsendt_naeringsdrivende_begrunnelser,
            ...muligeVirksomhetBegrunnelser,
          ]}
        />
      )}
      {(valgte_art_16_1_begrunnelser.length > 0 || art16_1_fritekst) && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 16, nr. 1:"
          valgteBegrunnelser={valgte_art_16_1_begrunnelser}
          muligeBegrunnelser={MKV.KTObjects.begrunnelser.avslag_anmodning_begrunnelser}
          fritekst={art16_1_fritekst}
        />
      )}
      {erNyVurdering && <Skjema.Vedtakstype redigerbart={redigerbart} />}
      <Nav.Row>
        <Nav.Column xs="8">
          <Skjema.Textarea
            feltNavn="vedtaksbrevFritekst"
            label="Fritekst til begrunnelse"
            readOnly={!redigerbart}
            maxLength={4000}
          />
        </Nav.Column>
      </Nav.Row>
      {redigerbart && skalViseSendOrienteringsbrev(sakstype, behandlingstema, erNyVurdering) && (
        <Skjema.Checkbox feltNavn="kopiTilArbeidsgiver" label="Send orienteringsbrev til arbeidsgiver/virksomhet" />
      )}
      {stegErGyldig && <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
      {erNyVurdering && redigerbart && (
        <Nav.Alert variant="info">{KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}</Nav.Alert>
      )}
      <Mui.StegKnapper
        bekreftTekst="Fatt vedtak"
        bekreftKnappProps={{
          loading: vedtakPending,
          disabled: !stegErGyldig,
          onClick: avslaa,
        }}
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </div>
  );
}

VurderingAvslag12_x_og_16.propTypes = {
  valgte_utsendt_arbeidstaker_begrunnelser: PT.array.isRequired,
  valgte_utsendt_naeringsdrivende_begrunnelser: PT.array.isRequired,
  valgte_art_16_1_begrunnelser: PT.array.isRequired,
  art16_1_fritekst: PT.string,
  vilkarBegrunnelser: PT.array.isRequired,
  behandlingID: PT.number.isRequired,
  tilbake: PT.func.isRequired,
  redigerbart: PT.bool,
  sakstype: PT.string.isRequired,
  behandlingstype: PT.string.isRequired,
  behandlingstema: PT.string.isRequired,
  harFeilmeldinger: PT.bool.isRequired,
  formIsValid: PT.bool.isRequired,
  touch: PT.func.isRequired,
  formValues: PT.object,
  validerMottatteOpplysninger: PT.func.isRequired,
  mottatteOpplysningerStatus: PT.string.isRequired,
  aktivtSteg: PT.bool,
};

const VurderingAvslagArtikkel12Og16Form = reduxForm({
  form: KV.Form.AVSLAG_ARTIKKEL_12_OG_16,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(VurderingAvslagArtikkel12Og16Schema, {
      context: {
        behandlingstype: props.behandlingstype,
      },
    })(values),
})(VurderingAvslag12_x_og_16);

const mapStateToProps = (state) => ({
  valgte_utsendt_arbeidstaker_begrunnelser: vilkarSelectors.Artikkel12_1BegrunnelserSelector(state),
  valgte_utsendt_naeringsdrivende_begrunnelser: vilkarSelectors.Artikkel12_2BegrunnelserSelector(state),
  valgte_art_16_1_begrunnelser: vilkarSelectors.Artikkel16_1BegrunnelserSelector(state),
  art16_1_fritekst: vilkarSelectors.Artikkel16_1FritekstSelector(state),
  vilkarBegrunnelser: vilkarSelectors.VilkarBegrunnelserSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  formIsValid: isValid(KV.Form.AVSLAG_ARTIKKEL_12_OG_16)(state),
  formValues: getFormValues(KV.Form.AVSLAG_ARTIKKEL_12_OG_16)(state),
  initialValues: {
    vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
    vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
    vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
  },
  mottatteOpplysningerStatus: mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector(state),
});

export default connect(mapStateToProps)(VurderingAvslagArtikkel12Og16Form);
